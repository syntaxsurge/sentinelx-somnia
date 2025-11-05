import { getConvexClient } from '@/lib/convexClient'

import { runSentinelIndexer } from './indexer'

type PolicyRunOptions = {
  demoTenantId?: string
}

export async function runPolicyOnce(options: PolicyRunOptions = {}) {
  const convex = getConvexClient()
  const result = await runSentinelIndexer({
    convex,
    demoTenantId: options.demoTenantId
  })
  return result
}
