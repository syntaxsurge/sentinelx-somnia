import { NextResponse } from 'next/server'

import { getConvexClient } from '@/lib/convexClient'
import { loadChainConfig } from '@/lib/config'

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
  let routerConfigured = false
  try {
    const config = await loadChainConfig()
    routerConfigured = Boolean(config.oracleRouter)
  } catch {
    routerConfigured = Boolean(process.env.NEXT_PUBLIC_SAFE_ORACLE_ROUTER)
  }
  const convexConnected = await checkConvex()

  const payload: HealthStatus = {
    ok: routerConfigured && convexConnected,
    timestamp: new Date().toISOString(),
    routerConfigured,
    convexConnected,
    details: !routerConfigured
      ? 'NEXT_PUBLIC_SAFE_ORACLE_ROUTER is not set'
      : convexConnected
        ? undefined
        : 'Convex endpoint unreachable or misconfigured'
  }

  const status = payload.ok ? 200 : 503
  return NextResponse.json(payload, { status })
}

export const revalidate = 0
