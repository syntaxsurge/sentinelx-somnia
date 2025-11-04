import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'
import { isAddress, isPositiveInteger, sanitizeAddress } from '@/lib/validation'

export async function GET(request: Request) {
  const client = getConvexClient()
  const { searchParams } = new URL(request.url)
  const tenantParam = searchParams.get('tenantId') ?? undefined
  const monitors = await client.query('monitors:list' as any, {
    tenantId: tenantParam
  })
  return NextResponse.json({ monitors })
}

export async function POST(request: Request) {
  const client = getConvexClient()
  const payload = await request.json()

  const tenantId = payload.tenantId
  const contractAddress = sanitizeAddress(payload.contractAddress ?? '')
  const guardianAddress = sanitizeAddress(payload.guardianAddress ?? '')
  const routerAddress = sanitizeAddress(payload.routerAddress ?? '')
  const protofireFeed = sanitizeAddress(payload.protofireFeed ?? '')
  const diaFeed = sanitizeAddress(payload.diaFeed ?? '')
  const oracleKey = (payload.oracleKey ?? '').trim()
  const maxDeviationBps = Number(payload.maxDeviationBps)
  const staleAfterSeconds = Number(payload.staleAfterSeconds)

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 })
  }

  const missingAddressField =
    !isAddress(contractAddress) ||
    !isAddress(guardianAddress) ||
    !isAddress(routerAddress) ||
    !isAddress(protofireFeed) ||
    !isAddress(diaFeed)

  if (missingAddressField) {
    return NextResponse.json(
      { error: 'All addresses must be 0x-prefixed Somnia addresses' },
      { status: 400 }
    )
  }

  if (!oracleKey) {
    return NextResponse.json(
      { error: 'oracleKey is required' },
      { status: 400 }
    )
  }

  if (
    Number.isNaN(maxDeviationBps) ||
    Number.isNaN(staleAfterSeconds) ||
    !isPositiveInteger(maxDeviationBps) ||
    !isPositiveInteger(staleAfterSeconds)
  ) {
    return NextResponse.json(
      { error: 'maxDeviationBps and staleAfterSeconds must be numbers' },
      { status: 400 }
    )
  }

  const monitorId = await client.mutation('monitors:create' as any, {
    tenantId,
    contractAddress,
    guardianAddress,
    routerAddress,
    oracleKey,
    protofireFeed,
    diaFeed,
    maxDeviationBps,
    staleAfterSeconds
  })

  return NextResponse.json({ monitorId }, { status: 201 })
}
