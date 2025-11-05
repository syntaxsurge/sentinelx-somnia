import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'
import { SiweMessage } from 'siwe'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '@/convex/_generated/api'
import { sessionOptions, type AuthSession } from '@/lib/session'

function resolveDomain() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL).host
  }
  return process.env.VERCEL_URL ?? 'localhost:3000'
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = await getIronSession<AuthSession>(cookieStore, sessionOptions)

  try {
    const { message, signature } = await request.json()
    if (!message || !signature) {
      return NextResponse.json(
        { ok: false, error: 'Missing message or signature' },
        { status: 400 }
      )
    }

    const siwe = new SiweMessage(message)
    const { success } = await siwe.verify({
      signature,
      domain: resolveDomain(),
      nonce: session.nonce
    })

    if (!success) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    session.address = siwe.address as `0x${string}`
    session.chainId = Number(siwe.chainId)
    session.isLoggedIn = true
    session.nonce = undefined
    await session.save()

    const convexUrl =
      process.env.CONVEX_DEPLOYMENT ??
      process.env.CONVEX_DEPLOYMENT_URL ??
      process.env.NEXT_PUBLIC_CONVEX_URL

    if (convexUrl) {
      const client = new ConvexHttpClient(convexUrl)
      try {
        await client.mutation(api.users.upsertFromSiwe, {
          address: session.address
        })
      } catch (error) {
        console.warn('Convex upsertFromSiwe failed', error)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Unable to verify SIWE message' },
      { status: 400 }
    )
  }
}
