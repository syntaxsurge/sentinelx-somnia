import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'
import { isAddress, sanitizeAddress } from '@/lib/validation'

export async function GET() {
  const client = getConvexClient()
  const tenants = await client.query('tenants:list' as any, {})
  return NextResponse.json({ tenants })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  const owner = sanitizeAddress(payload?.owner ?? '')
  const name = (payload?.name ?? '').trim()

  if (!owner || !name) {
    return NextResponse.json(
      { error: 'owner and name are required' },
      { status: 400 }
    )
  }

  if (!isAddress(owner)) {
    return NextResponse.json(
      { error: 'owner must be a valid 0x-prefixed address' },
      { status: 400 }
    )
  }

  const tenantId = await client.mutation('tenants:create' as any, {
    owner,
    name
  })

  return NextResponse.json({ tenantId }, { status: 201 })
}
