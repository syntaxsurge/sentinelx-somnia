import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'

export async function GET(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId')

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 })
  }

  const webhooks = await client.query('webhooks:list' as any, { tenantId })
  return NextResponse.json({ webhooks })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  const tenantId = payload?.tenantId
  const label = (payload?.label ?? '').trim()
  const kind = (payload?.kind ?? '').trim()
  const destination = (payload?.destination ?? '').trim()
  const secret = (payload?.secret ?? '').trim() || undefined

  if (!tenantId || !label || !kind || !destination) {
    return NextResponse.json(
      { error: 'tenantId, label, kind, and destination are required' },
      { status: 400 }
    )
  }

  const webhookId = await client.mutation('webhooks:create' as any, {
    tenantId,
    label,
    kind,
    destination,
    secret
  })

  return NextResponse.json({ webhookId }, { status: 201 })
}

export async function DELETE(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const webhookId = searchParams.get('webhookId')

  if (!webhookId) {
    return NextResponse.json(
      { error: 'webhookId is required' },
      { status: 400 }
    )
  }

  await client.mutation('webhooks:remove' as any, { webhookId })
  return NextResponse.json({ ok: true })
}

export const revalidate = 0
