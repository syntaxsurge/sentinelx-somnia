import { NextResponse } from 'next/server'

import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { getConvexClient } from '@/lib/convexClient'
import { requireApiKey } from '@/lib/auth/apiKey'
import { isAddress, isPositiveInteger, sanitizeAddress } from '@/lib/validation'

export async function GET(request: Request) {
  const apiKey = await requireApiKey(request)
  if (!apiKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const client = getConvexClient()
  const monitors = await client.query(api.monitors.list, {
    tenantId: apiKey.tenantId
  })
  return NextResponse.json({ monitors })
}

export async function POST(request: Request) {
  const apiKey = await requireApiKey(request)
  if (!apiKey) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const client = getConvexClient()
  const payload = await request.json()

  const tenantId = payload.tenantId as Id<'tenants'>
  const name = (payload.name ?? '').toString().trim()
  const type = (payload.type ?? 'price').toString().trim()
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

  if (tenantId !== apiKey.tenantId) {
    return NextResponse.json(
      { error: 'tenantId does not match credential scope' },
      { status: 403 }
    )
  }

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  if (type !== 'price') {
    return NextResponse.json(
      { error: 'only price monitors are currently supported' },
      { status: 400 }
    )
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

  const monitorId = await client.mutation(api.monitors.create, {
    tenantId,
    name,
    type,
    params: {
      oracleKey,
      maxDeviationBps,
      staleAfterSeconds
    },
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
