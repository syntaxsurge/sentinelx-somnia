import { getIronSession } from 'iron-session'
import { NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { somniaShannon } from '@/lib/chain'
import { getConvexClient } from '@/lib/convexClient'
import {
  applySessionCookies,
  sessionOptions,
  type AuthSession
} from '@/lib/session'

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

  const privateKey = process.env.OPERATOR_PRIVATE_KEY
  if (!privateKey || !privateKey.startsWith('0x')) {
    const response = NextResponse.json(
      { error: 'OPERATOR_PRIVATE_KEY is not configured on the server' },
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

    const hash = await walletClient.sendTransaction({
      to: target as `0x${string}`,
      data: calldata as `0x${string}`
    })

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
    const response = NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to execute guardian transaction'
      },
      { status: 500 }
    )
    return applySessionCookies(sessionResponse, response)
  }
}
