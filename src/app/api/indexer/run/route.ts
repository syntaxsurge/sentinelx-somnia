import { NextResponse } from 'next/server'

import { runSentinelIndexer } from '@/jobs/indexer'
import { getConvexServerClient } from '@/lib/convexServer'

export async function GET() {
  try {
    const result = await runSentinelIndexer({
      convex: getConvexServerClient()
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Indexer GET failed', error)
    return NextResponse.json(
      {
        error: 'convex_unreachable',
        message:
          'Convex deployment not reachable. Run pnpm convex:dev or set NEXT_PUBLIC_CONVEX_URL before invoking the indexer.',
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 503 }
    )
  }
}

export async function POST() {
  try {
    const result = await runSentinelIndexer({
      convex: getConvexServerClient()
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Indexer POST failed', error)
    return NextResponse.json(
      {
        error: 'convex_unreachable',
        message:
          'Convex deployment not reachable. Run pnpm convex:dev or set NEXT_PUBLIC_CONVEX_URL before invoking the indexer.',
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 503 }
    )
  }
}
