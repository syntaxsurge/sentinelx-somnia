import { randomBytes } from 'crypto'

import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'

import { applySessionCookies, sessionOptions, type AuthSession } from '@/lib/session'

export async function GET(request: Request) {
  const sessionResponse = new NextResponse()
  const session = await getIronSession<AuthSession>(
    request,
    sessionResponse,
    sessionOptions
  )
  // Reuse existing nonce to avoid mismatch if getNonce is called multiple times
  const nonce =
    session.nonce && session.nonce.length >= 8
      ? session.nonce
      : randomBytes(16).toString('hex')
  session.nonce = nonce
  await session.save()
  const response = new NextResponse(nonce, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })

  return applySessionCookies(sessionResponse, response)
}
