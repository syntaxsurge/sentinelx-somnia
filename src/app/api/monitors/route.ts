import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'

export async function GET(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const tenantParam = searchParams.get('tenantId')
  const monitors = await client.query('monitors:list' as any, {
    tenantId: tenantParam
  })
  return NextResponse.json({ monitors })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  const maxDeviationBps = Number(payload.maxDeviationBps)
  const staleAfterSeconds = Number(payload.staleAfterSeconds)

  if (Number.isNaN(maxDeviationBps) || Number.isNaN(staleAfterSeconds)) {
    return NextResponse.json(
      { error: 'maxDeviationBps and staleAfterSeconds must be numbers' },
      { status: 400 }
    )
  }

  const monitorId = await client.mutation('monitors:create' as any, {
    tenantId: payload.tenantId,
    contractAddress: payload.contractAddress,
    guardianAddress: payload.guardianAddress,
    routerAddress: payload.routerAddress,
    oracleKey: payload.oracleKey,
    protofireFeed: payload.protofireFeed,
    diaFeed: payload.diaFeed,
    maxDeviationBps,
    staleAfterSeconds
  })

  return NextResponse.json({ monitorId }, { status: 201 })
}
