import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'

export async function GET(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const monitorParam = searchParams.get('monitorId')
  const incidents = await client.query('incidents:list' as any, {
    monitorId: monitorParam
  })
  return NextResponse.json({ incidents })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  const incidentId = await client.mutation('incidents:record' as any, {
    monitorId: payload.monitorId,
    safe: payload.safe,
    bothFresh: payload.bothFresh,
    action: payload.action,
    txHash: payload.txHash,
    summary: payload.summary,
    details: payload.details
  })

  return NextResponse.json({ incidentId }, { status: 201 })
}
