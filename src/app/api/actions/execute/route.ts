import { getIronSession } from 'iron-session'
import { NextResponse } from 'next/server'
import {
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  getAddress,
  http,
  isAddress,
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

  const target =
    (intent.plan as any)?.target ??
    (intent.plan?.arguments as any)?.target ??
    null
  const calldata = (intent.plan as any)?.calldata ?? null

  if (
    typeof target !== 'string' ||
    !target.startsWith('0x') ||
    target.length !== 42 ||
    typeof calldata !== 'string' ||
    !calldata.startsWith('0x')
  ) {
    const response = NextResponse.json(
      { error: 'Missing executable target or calldata on action intent' },
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
    const guardianHub = chainConfig.guardianHub.toLowerCase()
    const agentInbox = chainConfig.agentInbox.toLowerCase()
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

    const executionTarget = resolveExecutionPlan(
      {
        target,
        calldata: calldata as `0x${string}`
      },
      {
        guardianHub: chainConfig.guardianHub,
        agentInbox: chainConfig.agentInbox
      }
    )

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
    const status = error instanceof ContractFunctionRevertedError ? 400 : 500
    const response = NextResponse.json({ error: message }, { status })
    return applySessionCookies(sessionResponse, response)
  }
}

function resolveExecutionPlan(
  plan: { target: string; calldata: `0x${string}` },
  config: {
    guardianHub: `0x${string}`
    agentInbox: `0x${string}`
  }
): ExecutionPlan {
  if (!isAddress(plan.target)) {
    throw new Error('Action intent has an invalid target address')
  }

  const normalizedTarget = getAddress(plan.target)
  const guardianAddress = getAddress(config.guardianHub)
  const agentInboxAddress = getAddress(config.agentInbox)

  if (!plan.calldata || !plan.calldata.startsWith('0x')) {
    throw new Error('Action intent is missing executable calldata')
  }

  const guardianCall = tryDecodeGuardian(plan.calldata)

  if (guardianCall) {
    if (normalizedTarget !== guardianAddress) {
      throw new Error('Guardian calls must target the configured GuardianHub')
    }

    const execution = {
      type: 'guardian',
      functionName: guardianCall.functionName,
      args: guardianCall.args,
      guardable: guardianCall.guardable
    } as const

    return execution
  }

  if (normalizedTarget === agentInboxAddress) {
    const agentCall = tryDecodeAgentInbox(plan.calldata)
    if (!agentCall) {
      throw new Error('Unsupported AgentInbox calldata')
    }

    if (agentCall.args[0] !== guardianAddress) {
      throw new Error('AgentInbox calls must relay to the configured GuardianHub')
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

  throw new Error('Unsupported action intent target. Only GuardianHub or AgentInbox calls are allowed.')
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
