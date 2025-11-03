import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'

export async function GET() {
  const client = getConvexClient()
  const tenants = await client.query('tenants:list' as any, {})
  return NextResponse.json({ tenants })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  if (!payload?.owner || !payload?.name) {
    return NextResponse.json(
      { error: 'owner and name are required' },
      { status: 400 }
    )
  }

  const tenantId = await client.mutation('tenants:create' as any, {
    owner: payload.owner,
    name: payload.name
  })

  return NextResponse.json({ tenantId }, { status: 201 })
}
