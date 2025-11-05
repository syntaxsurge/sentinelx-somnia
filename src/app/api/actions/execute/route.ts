import { getIronSession } from 'iron-session'
import { NextResponse } from 'next/server'
import {
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  encodeFunctionData,
  getAddress,
  http,
  isAddress,
  isAddressEqual,
  parseAbi
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { loadChainConfig } from '@/lib/config'
import { somniaShannon } from '@/lib/chain'
import { getConvexClient } from '@/lib/convexClient'
import {
  applySessionCookies,
  sessionOptions,
  type AuthSession
} from '@/lib/session'

const guardianAbi = parseAbi([
  'function pauseTarget(address target)',
  'function unpauseTarget(address target)',
  'function registerTarget(address target)',
  'function registered(address target) view returns (bool)'
])

const agentInboxAbi = parseAbi([
  'function execute(address target, bytes data)'
])

type GuardianFunction = 'pauseTarget' | 'unpauseTarget'

type ExecutionPlan =
  | {
      type: 'guardian'
      functionName: GuardianFunction
      args: readonly [`0x${string}`]
      guardable: `0x${string}`
    }
  | {
      type: 'agentInbox'
      functionName: 'execute'
      args: readonly [`0x${string}`, `0x${string}`]
      guardable?: `0x${string}`
    }

export async function POST(request: Request) {
  const sessionResponse = new NextResponse()
  const session = await getIronSession<AuthSession>(
    request,
    sessionResponse,
    sessionOptions
  )

  if (!session?.address) {
    const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    return applySessionCookies(sessionResponse, response)
  }

  let payload: { intentId?: string }
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  if (!payload.intentId) {
    const response = NextResponse.json({ error: 'intentId is required' }, { status: 400 })
    return applySessionCookies(sessionResponse, response)
  }

  const convex = getConvexClient()
  const intent = await convex.query(api.actionIntents.get, {
    intentId: payload.intentId as Id<'actionIntents'>
  })

  if (!intent) {
    const response = NextResponse.json({ error: 'Action intent not found' }, { status: 404 })
    return applySessionCookies(sessionResponse, response)
  }

  if (intent.state !== 'approved') {
    const response = NextResponse.json(
      { error: 'Action intent must be approved before execution' },
      { status: 400 }
    )
    return applySessionCookies(sessionResponse, response)
  }

  const privateKey =
    process.env.EXECUTOR_PRIVATE_KEY ?? process.env.OPERATOR_PRIVATE_KEY
  if (!privateKey || !privateKey.startsWith('0x')) {
    const response = NextResponse.json(
      { error: 'Execution signer is not configured on the server' },
      { status: 500 }
    )
    return applySessionCookies(sessionResponse, response)
  }

  const rpcUrl =
    process.env.NEXT_PUBLIC_SOMNIA_RPC_URL ?? process.env.SOMNIA_RPC_URL
  if (!rpcUrl) {
    const response = NextResponse.json(
      { error: 'Somnia RPC URL is not configured' },
      { status: 500 }
    )
    return applySessionCookies(sessionResponse, response)
  }

  try {
    const chainConfig = await loadChainConfig()
    const executionTarget = resolveExecutionPlan(intent.plan, {
      guardianHub: chainConfig.guardianHub,
      agentInbox: chainConfig.agentInbox
    })

    const account = privateKeyToAccount(privateKey as `0x${string}`)
    const walletClient = createWalletClient({
      chain: somniaShannon,
      transport: http(rpcUrl),
      account
    })
    const publicClient = createPublicClient({
      chain: somniaShannon,
      transport: http(rpcUrl)
    })

    if (
      executionTarget.guardable &&
      !(
        await publicClient.readContract({
          address: chainConfig.guardianHub,
          abi: guardianAbi,
          functionName: 'registered',
          args: [executionTarget.guardable]
        })
      )
    ) {
      const { request: registerRequest } = await publicClient.simulateContract({
        address: chainConfig.guardianHub,
        abi: guardianAbi,
        functionName: 'registerTarget',
        args: [executionTarget.guardable],
        account
      })

      const registerHash = await walletClient.writeContract(registerRequest)
      await publicClient.waitForTransactionReceipt({ hash: registerHash })
    }

    let executeRequest: Parameters<typeof walletClient.writeContract>[0]
    if (executionTarget.type === 'guardian') {
      const { request } = await publicClient.simulateContract({
        address: chainConfig.guardianHub,
        abi: guardianAbi,
        functionName: executionTarget.functionName,
        args: executionTarget.args,
        account
      })
      executeRequest = request
    } else {
      const { request } = await publicClient.simulateContract({
        address: chainConfig.agentInbox,
        abi: agentInboxAbi,
        functionName: 'execute',
        args: executionTarget.args,
        account
      })
      executeRequest = request
    }

    const hash = await walletClient.writeContract(executeRequest)

    await publicClient.waitForTransactionReceipt({ hash })

    await convex.mutation(api.actionIntents.setState, {
      intentId: intent._id as Id<'actionIntents'>,
      state: 'executed',
      actor: session.address,
      txHash: hash
    })

    const response = NextResponse.json({ ok: true, txHash: hash })
    return applySessionCookies(sessionResponse, response)
  } catch (error) {
    console.error('actions/execute error', error)
    const message = extractErrorMessage(error)
    const status =
      error instanceof ContractFunctionRevertedError || error instanceof ActionPlanError
        ? 400
        : 500
    const response = NextResponse.json({ error: message }, { status })
    return applySessionCookies(sessionResponse, response)
  }
}

class ActionPlanError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActionPlanError'
  }
}

function resolveExecutionPlan(
  planPayload: unknown,
  config: {
    guardianHub: `0x${string}`
    agentInbox: `0x${string}`
  }
): ExecutionPlan {
  const byName = resolveExecutionPlanByName(planPayload, config)
  if (byName) {
    return byName
  }

  const fallback = resolveExecutionPlanFromCalldata(planPayload, config)
  if (fallback) {
    return fallback
  }

  throw new ActionPlanError('Action intent is missing executable calldata; regenerate the plan or execute manually.')
}

function resolveExecutionPlanByName(
  planPayload: unknown,
  config: {
    guardianHub: `0x${string}`
    agentInbox: `0x${string}`
  }
): ExecutionPlan | null {
  if (!planPayload || typeof planPayload !== 'object') {
    return null
  }

  const plan = planPayload as Record<string, unknown>
  const name = typeof plan.name === 'string' ? plan.name : undefined
  if (!name) {
    return null
  }

  const args = (plan.arguments ?? {}) as Record<string, unknown>

  switch (name) {
    case 'propose_pause_market': {
      const guardable =
        pickAddress([
          args.contract,
          args.guardable,
          args.contractAddress,
          args.market,
          (plan as any).guardable,
          (plan as any).contract
        ]) ??
        (typeof plan.calldata === 'string' && plan.calldata.startsWith('0x')
          ? tryDecodeGuardian(plan.calldata as `0x${string}`)?.guardable
          : undefined)

      if (!guardable) {
        return null
      }

      const callArgs: readonly [`0x${string}`] = [guardable]
      const useAgentInbox = shouldUseAgentInbox(plan, config.agentInbox)

      if (useAgentInbox) {
        const callData = encodeFunctionData({
          abi: guardianAbi,
          functionName: 'pauseTarget',
          args: callArgs
        })

        return {
          type: 'agentInbox',
          functionName: 'execute',
          args: [config.guardianHub, callData],
          guardable
        }
      }

      return {
        type: 'guardian',
        functionName: 'pauseTarget',
        args: callArgs,
        guardable
      }
    }
    case 'propose_set_limit': {
      throw new ActionPlanError(
        'Router parameter tuning requires manual execution today. Adjust the SafeOracleRouter directly and mark the action resolved.'
      )
    }
    default:
      return null
  }
}

function resolveExecutionPlanFromCalldata(
  planPayload: unknown,
  config: {
    guardianHub: `0x${string}`
    agentInbox: `0x${string}`
  }
): ExecutionPlan | null {
  if (!planPayload || typeof planPayload !== 'object') {
    return null
  }

  const plan = planPayload as Record<string, unknown>
  const args = (plan.arguments ?? {}) as Record<string, unknown>
  const target = pickAddress([plan.target, args.target])
  const calldata =
    typeof plan.calldata === 'string' && plan.calldata.startsWith('0x')
      ? (plan.calldata as `0x${string}`)
      : undefined

  if (!target || !calldata) {
    return null
  }

  return resolveExecutionPlanFromTargetAndCalldata(
    { target, calldata },
    config
  )
}

function resolveExecutionPlanFromTargetAndCalldata(
  plan: { target: `0x${string}`; calldata: `0x${string}` },
  config: {
    guardianHub: `0x${string}`
    agentInbox: `0x${string}`
  }
): ExecutionPlan {
  if (!isAddress(plan.target)) {
    throw new ActionPlanError('Action intent has an invalid target address')
  }

  const normalizedTarget = getAddress(plan.target)
  const guardianAddress = getAddress(config.guardianHub)
  const agentInboxAddress = getAddress(config.agentInbox)

  if (!plan.calldata || !plan.calldata.startsWith('0x')) {
    throw new ActionPlanError('Action intent is missing executable calldata')
  }

  const guardianCall = tryDecodeGuardian(plan.calldata)

  if (guardianCall) {
    if (normalizedTarget !== guardianAddress) {
      throw new ActionPlanError('GuardianHub calls must target the configured GuardianHub address')
    }

    return {
      type: 'guardian',
      functionName: guardianCall.functionName,
      args: guardianCall.args,
      guardable: guardianCall.guardable
    }
  }

  if (normalizedTarget === agentInboxAddress) {
    const agentCall = tryDecodeAgentInbox(plan.calldata)
    if (!agentCall) {
      throw new ActionPlanError('Unsupported AgentInbox calldata')
    }

    if (agentCall.args[0] !== guardianAddress) {
      throw new ActionPlanError('AgentInbox calls must relay to the configured GuardianHub')
    }

    let guardable: `0x${string}` | undefined
    const innerCalldata = agentCall.args[1]

    if (innerCalldata.startsWith('0x')) {
      const inner = tryDecodeGuardian(innerCalldata)
      guardable = inner?.guardable
    }

    return {
      type: 'agentInbox',
      functionName: 'execute',
      args: agentCall.args,
      guardable
    }
  }

  throw new ActionPlanError(
    'Unsupported action intent target. Only GuardianHub or AgentInbox calls are allowed.'
  )
}

function coerceAddress(value: unknown): `0x${string}` | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  try {
    return getAddress(value)
  } catch {
    return undefined
  }
}

function pickAddress(values: unknown[]): `0x${string}` | undefined {
  for (const value of values) {
    const address = coerceAddress(value)
    if (address) {
      return address
    }
  }
  return undefined
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`

function shouldUseAgentInbox(plan: Record<string, unknown>, agentInbox?: `0x${string}`): boolean {
  if (!agentInbox || isAddressEqual(agentInbox, ZERO_ADDRESS)) {
    return false
  }

  const execVia =
    typeof plan.execVia === 'string' ? plan.execVia.toLowerCase() : undefined
  if (execVia === 'agentinbox' || execVia === 'inbox') {
    return true
  }

  const args = (plan.arguments ?? {}) as Record<string, unknown>
  const explicitTarget = pickAddress([
    plan.target,
    args.target,
    (plan as any).executor,
    (plan as any).agentInbox
  ])

  return !!explicitTarget && isAddressEqual(explicitTarget, agentInbox)
}

function tryDecodeGuardian(
  data: `0x${string}`
):
  | {
      functionName: GuardianFunction
      args: readonly [`0x${string}`]
      guardable: `0x${string}`
    }
  | null {
  try {
    const decoded = decodeFunctionData({
      abi: guardianAbi,
      data
    })

    if (
      decoded.functionName === 'pauseTarget' ||
      decoded.functionName === 'unpauseTarget'
    ) {
      const [rawGuardable] = decoded.args as [`0x${string}`] | undefined[]
      if (!rawGuardable || !isAddress(rawGuardable)) {
        throw new Error('Missing guardable target')
      }
      const guardable = getAddress(rawGuardable)
      return {
        functionName: decoded.functionName,
        args: [guardable],
        guardable
      }
    }

    return null
  } catch {
    return null
  }
}

function tryDecodeAgentInbox(
  data: `0x${string}`
):
  | {
      args: readonly [`0x${string}`, `0x${string}`]
    }
  | null {
  try {
    const decoded = decodeFunctionData({
      abi: agentInboxAbi,
      data
    })

    if (decoded.functionName === 'execute') {
      const [target, calldata] = decoded.args as [`0x${string}`, `0x${string}`]
      if (!isAddress(target) || typeof calldata !== 'string' || !calldata.startsWith('0x')) {
        throw new Error('Invalid AgentInbox arguments')
      }

      return {
        args: [getAddress(target), calldata as `0x${string}`]
      }
    }

    return null
  } catch {
    return null
  }
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof ActionPlanError) {
    return error.message
  }

  if (error instanceof ContractFunctionRevertedError) {
    return error.reason ?? error.shortMessage ?? 'Contract reverted during execution'
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'shortMessage' in error &&
    typeof (error as { shortMessage: unknown }).shortMessage === 'string'
  ) {
    return (error as { shortMessage: string }).shortMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to execute guardian transaction'
}
