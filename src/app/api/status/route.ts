import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'

type HealthStatus = {
  ok: boolean
  timestamp: string
  routerConfigured: boolean
  convexConnected: boolean
  details?: string
}

async function checkConvex(): Promise<boolean> {
  try {
    const client = getConvexClient()
    await client.query('tenants:list' as any, {})
    return true
  } catch {
    return false
  }
}

export async function GET() {
  const routerConfigured = Boolean(process.env.SENTINELX_ROUTER_ADDRESS)
  const convexConnected = await checkConvex()

  const payload: HealthStatus = {
    ok: routerConfigured && convexConnected,
    timestamp: new Date().toISOString(),
    routerConfigured,
    convexConnected,
    details: !routerConfigured
      ? 'SENTINELX_ROUTER_ADDRESS is not set'
      : convexConnected
        ? undefined
        : 'Convex endpoint unreachable or misconfigured'
  }

  const status = payload.ok ? 200 : 503
  return NextResponse.json(payload, { status })
}

export const revalidate = 0
