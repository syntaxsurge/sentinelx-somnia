import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'

import { applySessionCookies, sessionOptions, type AuthSession } from '@/lib/session'

export async function POST(request: Request) {
  const sessionResponse = new NextResponse()
  const session = await getIronSession<AuthSession>(
    request,
    sessionResponse,
    sessionOptions
  )
  await session.destroy()
  const response = NextResponse.json({ ok: true })
  return applySessionCookies(sessionResponse, response)
}
