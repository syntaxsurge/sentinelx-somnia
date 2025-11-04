import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'

import { sessionOptions, type SessionUser } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const session = await getIronSession<{ user?: SessionUser }>(
    cookieStore as any,
    sessionOptions
  )
  return NextResponse.json({ user: session.user ?? null })
}
