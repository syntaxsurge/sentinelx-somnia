import { randomBytes } from 'crypto'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'

import { sessionOptions, type AuthSession } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<AuthSession>(cookieStore, sessionOptions)
  const nonce = randomBytes(16).toString('hex')
  session.nonce = nonce
  await session.save()
  return new NextResponse(nonce, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
