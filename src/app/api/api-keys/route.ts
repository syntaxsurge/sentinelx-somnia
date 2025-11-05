import { NextResponse } from 'next/server'

import { getIronSession } from 'iron-session'

import { api } from '@/convex/_generated/api'
import { getConvexClient } from '@/lib/convexClient'
import { generateApiKey } from '@/lib/apiKeys'
import { applySessionCookies, sessionOptions, type AuthSession } from '@/lib/session'
import { type Id } from '@/convex/_generated/dataModel'

export async function GET(request: Request) {
  const sessionResponse = new NextResponse()
  const session = await getIronSession<AuthSession>(
    request,
    sessionResponse,
    sessionOptions
  )

  if (!session?.isLoggedIn || !session.address) {
    const response = NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    return applySessionCookies(sessionResponse, response)
  }

  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId') ?? undefined

  let keys

  if (tenantId) {
    keys = await client.query(api.apiKeys.list, {
      tenantId: tenantId as Id<'tenants'>
    })
  } else {
    keys = await client.query(api.apiKeys.listAll, {})
  }

  const response = NextResponse.json({ keys })
  return applySessionCookies(sessionResponse, response)
}

export async function POST(request: Request) {
  const sessionResponse = new NextResponse()
  const session = await getIronSession<AuthSession>(
    request,
    sessionResponse,
    sessionOptions
  )

  if (!session?.isLoggedIn || !session.address) {
    const response = NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    return applySessionCookies(sessionResponse, response)
  }

  const client = getConvexClient()
  const payload = await request.json()

  const tenantId = payload?.tenantId
  const label = (payload?.label ?? '').trim()

  if (!tenantId || !label) {
    return NextResponse.json(
      { error: 'tenantId and label are required' },
      { status: 400 }
    )
  }

  const { key, hash } = generateApiKey()

  const apiKeyId = await client.mutation(api.apiKeys.create, {
    tenantId: tenantId as Id<'tenants'>,
    label,
    hash
  })

  const response = NextResponse.json({ apiKeyId, apiKey: key }, { status: 201 })
  return applySessionCookies(sessionResponse, response)
}

export async function DELETE(request: Request) {
  const sessionResponse = new NextResponse()
  const session = await getIronSession<AuthSession>(
    request,
    sessionResponse,
    sessionOptions
  )

  if (!session?.isLoggedIn || !session.address) {
    const response = NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    return applySessionCookies(sessionResponse, response)
  }

  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const apiKeyId = searchParams.get('apiKeyId')

  if (!apiKeyId) {
    return NextResponse.json(
      { error: 'apiKeyId is required' },
      { status: 400 }
    )
  }

  await client.mutation(api.apiKeys.remove, { apiKeyId: apiKeyId as Id<'apiKeys'> })
  const response = NextResponse.json({ ok: true })
  return applySessionCookies(sessionResponse, response)
}

export const revalidate = 0
