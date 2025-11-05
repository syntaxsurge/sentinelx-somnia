import { NextResponse } from 'next/server'

import { requireApiKey } from '@/lib/auth/apiKey'
import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { getConvexClient } from '@/lib/convexClient'
import { loadChainConfig } from '@/lib/config'
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
  const config = await loadChainConfig()

  const tenantId = payload.tenantId as Id<'tenants'>
  const name = (payload.name ?? '').toString().trim()
  const type = (payload.type ?? 'price').toString().trim()
  const oracleKey = (payload.oracleKey ?? '').toString().trim()
  const contractAddress = sanitizeAddress(
    payload.contractAddress ?? config.demoPausable
  )
  const guardianAddress = sanitizeAddress(
    payload.guardianAddress ?? config.guardianHub
  )
  const routerAddress = sanitizeAddress(
    payload.routerAddress ?? config.oracleRouter
  )
  const protofireFeed = sanitizeAddress(
    payload.protofireFeed ?? config.feeds?.[oracleKey]?.protofire ?? ''
  )
  const diaFeed = sanitizeAddress(
    payload.diaFeed ?? config.feeds?.[oracleKey]?.dia ?? ''
  )
  const agentInbox = sanitizeAddress(
    payload.agentInbox ?? config.agentInbox
  )
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

  if (!oracleKey) {
    return NextResponse.json(
      { error: 'oracleKey is required' },
      { status: 400 }
    )
  }

  const missingAddressField =
    !isAddress(contractAddress) ||
    !isAddress(guardianAddress) ||
    !isAddress(routerAddress) ||
    !isAddress(agentInbox) ||
    !isAddress(protofireFeed) ||
    !isAddress(diaFeed)

  if (missingAddressField) {
    return NextResponse.json(
      { error: 'All addresses must be 0x-prefixed Somnia addresses' },
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

  const overrideAllowed =
    process.env.ALLOW_CONTRACT_OVERRIDE === 'true' ||
    process.env.SENTINELX_ALLOW_CONTRACT_OVERRIDE === 'true'

  const canonicalFeed = config.feeds[oracleKey]
  if (!overrideAllowed && !canonicalFeed) {
    return NextResponse.json(
      { error: 'Oracle pair not available without override' },
      { status: 400 }
    )
  }

  const normalize = (value: string) => value.toLowerCase()

  const provided = {
    contractAddress: normalize(contractAddress),
    guardianAddress: normalize(guardianAddress),
    routerAddress: normalize(routerAddress),
    agentInbox: normalize(agentInbox),
    protofireFeed: normalize(protofireFeed),
    diaFeed: normalize(diaFeed)
  }

  const canonical = {
    contractAddress: normalize(config.demoPausable),
    guardianAddress: normalize(config.guardianHub),
    routerAddress: normalize(config.oracleRouter),
    agentInbox: normalize(config.agentInbox),
    protofireFeed: canonicalFeed
      ? normalize(canonicalFeed.protofire)
      : provided.protofireFeed,
    diaFeed: canonicalFeed
      ? normalize(canonicalFeed.dia)
      : provided.diaFeed
  }

  const overrideUsed =
    provided.contractAddress !== canonical.contractAddress ||
    provided.guardianAddress !== canonical.guardianAddress ||
    provided.routerAddress !== canonical.routerAddress ||
    provided.agentInbox !== canonical.agentInbox ||
    provided.protofireFeed !== canonical.protofireFeed ||
    provided.diaFeed !== canonical.diaFeed

  if (overrideUsed && !overrideAllowed) {
    return NextResponse.json(
      { error: 'Contract override disabled for this deployment' },
      { status: 400 }
    )
  }

  const selected = overrideAllowed ? provided : canonical

  const monitorId = await client.mutation(api.monitors.create, {
    tenantId,
    name,
    type,
    params: {
      oracleKey,
      maxDeviationBps,
      staleAfterSeconds,
      agentInbox: selected.agentInbox,
      demoOracle: config.demoOracle,
      demoPausable: config.demoPausable
    },
    contractAddress: selected.contractAddress,
    guardianAddress: selected.guardianAddress,
    routerAddress: selected.routerAddress,
    oracleKey,
    protofireFeed: selected.protofireFeed,
    diaFeed: selected.diaFeed,
    maxDeviationBps,
    staleAfterSeconds
  })

  return NextResponse.json({ monitorId }, { status: 201 })
}
