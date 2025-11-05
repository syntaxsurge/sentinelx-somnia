import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'
import { SiweMessage } from 'siwe'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '@/convex/_generated/api'
import { applySessionCookies, sessionOptions, type AuthSession } from '@/lib/session'

export async function POST(request: Request) {
  const sessionResponse = new NextResponse()
  const session = await getIronSession<AuthSession>(
    request,
    sessionResponse,
    sessionOptions
  )

  try {
    const { message, signature } = await request.json()
    if (!message || !signature) {
      return NextResponse.json(
        { ok: false, error: 'Missing message or signature' },
        { status: 400 }
      )
    }

    const siwe = new SiweMessage(message)
    if (!session.nonce) {
      return NextResponse.json(
        { ok: false, error: 'Missing nonce for SIWE verification' },
        { status: 400 }
      )
    }

    const { success } = await siwe.verify({
      signature,
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
      const normalizedUrl = convexUrl.trim()
      const isHttpUrl =
        normalizedUrl.startsWith('https://') || normalizedUrl.startsWith('http://')

      if (!isHttpUrl) {
        console.warn(
          'Skipping Convex upsertFromSiwe: expected http(s) deployment URL, received',
          normalizedUrl
        )
      } else {
        const client = new ConvexHttpClient(normalizedUrl)
        try {
          await client.mutation(api.users.upsertFromSiwe, {
            address: session.address
          })
        } catch (error) {
          console.warn('Convex upsertFromSiwe failed', error)
        }
      }
    }

    const response = NextResponse.json({ ok: true })
    return applySessionCookies(sessionResponse, response)
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Unable to verify SIWE message' },
      { status: 400 }
    )
  }
}
