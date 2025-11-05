import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'

export async function GET(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId')

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 })
  }

  const guardians = await client.query('guardianOperators:list' as any, {
    tenantId
  })
  return NextResponse.json({ guardians })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  const tenantId = payload?.tenantId
  const address = (payload?.address ?? '').trim()
  const role = (payload?.role ?? '').trim() || undefined
  const note = (payload?.note ?? '').trim() || undefined

  if (!tenantId || !address) {
    return NextResponse.json(
      { error: 'tenantId and address are required' },
      { status: 400 }
    )
  }

  const guardianId = await client.mutation('guardianOperators:add' as any, {
    tenantId,
    address,
    role,
    note
  })

  return NextResponse.json({ guardianId }, { status: 201 })
}

export async function DELETE(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const guardianId = searchParams.get('guardianId')

  if (!guardianId) {
    return NextResponse.json(
      { error: 'guardianId is required' },
      { status: 400 }
    )
  }

  await client.mutation('guardianOperators:remove' as any, { guardianId })
  return NextResponse.json({ ok: true })
}

export const revalidate = 0
