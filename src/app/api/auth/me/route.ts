import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'

import { sessionOptions, type AuthSession } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<AuthSession>(cookieStore, sessionOptions)
  const { isLoggedIn = false, address, chainId } = session
  return NextResponse.json({
    isLoggedIn: Boolean(isLoggedIn),
    address: address ?? null,
    chainId: chainId ?? null
  })
}
