import { getIronSession } from 'iron-session'
import { NextResponse } from 'next/server'
import { createWalletClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { somniaShannon } from '@/lib/chain'
import { loadChainConfig } from '@/lib/config'
import { getConvexClient } from '@/lib/convexClient'
import {
  applySessionCookies,
  sessionOptions,
  type AuthSession
} from '@/lib/session'
import { api } from '@/convex/_generated/api'
import { runPolicyOnce } from '@/jobs/policyRunner'

const demoOracleAbi = parseAbi(['function setPrice(int256 p) external'])

export async function POST(request: Request) {
  const config = await loadChainConfig()

  if (!config.demoMode) {
    return NextResponse.json({ error: 'Demo mode disabled' }, { status: 403 })
  }

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

  const convex = getConvexClient()

  const tenant = await convex.query(api.tenants.getByOwner, {
    owner: session.address
  })

  if (!tenant?._id) {
    const response = NextResponse.json(
      { error: 'Tenant not found for current wallet' },
      { status: 404 }
    )
    return applySessionCookies(sessionResponse, response)
  }

  const monitors = await convex.query(api.monitors.listForTenant, {
    tenantId: tenant._id
  })

  if (!monitors.length) {
    const response = NextResponse.json(
      { error: 'No monitors registered for this workspace' },
      { status: 400 }
    )
    return applySessionCookies(sessionResponse, response)
  }

  let executedOnChain = false

  const privateKey = process.env.OPERATOR_PRIVATE_KEY
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOMNIA_RPC_URL ?? process.env.SOMNIA_RPC_URL

  try {
    if (privateKey && privateKey.startsWith('0x') && rpcUrl) {
      const account = privateKeyToAccount(privateKey as `0x${string}`)
      const client = createWalletClient({
        chain: somniaShannon,
        transport: http(rpcUrl),
        account
      })

      const spikePrice = 3000_00000000n
      await client.writeContract({
        address: config.demoOracle,
        abi: demoOracleAbi,
        functionName: 'setPrice',
        args: [spikePrice],
        account
      })

      executedOnChain = true
    }
  } catch (error) {
    console.error('demo/simulate error', error)
  }

  if (!executedOnChain) {
    await convex.mutation(api.monitors.markDemoSpike, {
      tenantId: tenant._id,
      durationMs: 5 * 60_000
    })
  }

  const policyResult = await runPolicyOnce({
    demoTenantId: tenant._id
  })

  const response = NextResponse.json({
    ok: true,
    mode: executedOnChain ? 'on-chain' : 'fallback',
    policyResult
  })
  return applySessionCookies(sessionResponse, response)
}
