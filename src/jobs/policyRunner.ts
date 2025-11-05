import { getConvexClient } from '@/lib/convexClient'

import { runSentinelIndexer } from './indexer'

export async function runPolicyOnce() {
  const convex = getConvexClient()
  const result = await runSentinelIndexer({ convex })
  return result
}
