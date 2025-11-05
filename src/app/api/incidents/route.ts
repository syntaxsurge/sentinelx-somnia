import { NextResponse } from 'next/server'

import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { getConvexClient } from '@/lib/convexClient'
import { requireApiKey } from '@/lib/auth/apiKey'

export async function GET(request: Request) {
  const apiKey = await requireApiKey(request)
  if (!apiKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const monitorParam = searchParams.get('monitorId') ?? undefined

  if (monitorParam) {
    const monitorId = monitorParam as Id<'monitors'>
    const monitor = await client.query(api.monitors.get, { monitorId })

    if (!monitor || monitor.tenantId !== apiKey.tenantId) {
      return NextResponse.json({ error: 'monitor not found' }, { status: 404 })
    }

    const incidents = await client.query(api.incidents.list, {
      monitorId
    })
    return NextResponse.json({ incidents })
  }

  const incidents = await client.query(api.incidents.listForTenant, {
    tenantId: apiKey.tenantId,
    limit: 100
  })
  return NextResponse.json({ incidents })
}

export async function POST(request: Request) {
  const apiKey = await requireApiKey(request)
  if (!apiKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const client = getConvexClient()
  const payload = await request.json()

  const monitorId = payload.monitorId as Id<'monitors'>
  if (!monitorId) {
    return NextResponse.json({ error: 'monitorId is required' }, { status: 400 })
  }

  const monitor = await client.query(api.monitors.get, { monitorId })
  if (!monitor || monitor.tenantId !== apiKey.tenantId) {
    return NextResponse.json({ error: 'monitor not found' }, { status: 404 })
  }

  const incidentId = await client.mutation(api.incidents.record, {
    monitorId,
    safe: payload.safe,
    bothFresh: payload.bothFresh,
    action: payload.action,
    txHash: payload.txHash,
    summary: payload.summary,
    details: payload.details
  })

  return NextResponse.json({ incidentId }, { status: 201 })
}
