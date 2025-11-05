import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'

import { sessionOptions, type AuthSession } from '@/lib/session'

export async function POST() {
  const cookieStore = await cookies()
  const session = await getIronSession<AuthSession>(cookieStore, sessionOptions)
  await session.destroy()
  return NextResponse.json({ ok: true })
}
