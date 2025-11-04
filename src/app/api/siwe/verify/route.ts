import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'
import { SiweMessage } from 'siwe'

import { sessionOptions, type SessionUser } from '@/lib/session'

export async function POST(request: NextRequest) {
  const { message, signature } = await request.json()
  const siweMessage = new SiweMessage(message)
  const result = await siweMessage.verify({ signature })

  if (!result.success) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const cookieStore = await cookies()
  const session = await getIronSession<{ user?: SessionUser }>(
    cookieStore as any,
    sessionOptions
  )
  session.user = { address: siweMessage.address as `0x${string}` }
  await session.save()

  return NextResponse.json({
    ok: true,
    address: siweMessage.address
  })
}
