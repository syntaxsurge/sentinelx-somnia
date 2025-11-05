import { NextResponse } from 'next/server'

import { runSentinelIndexer } from '@/jobs/indexer'
import { getConvexServerClient } from '@/lib/convexServer'

export async function GET() {
  const result = await runSentinelIndexer({
    convex: getConvexServerClient()
  })
  return NextResponse.json(result)
}

export async function POST() {
  const result = await runSentinelIndexer({
    convex: getConvexServerClient()
  })
  return NextResponse.json(result)
}
