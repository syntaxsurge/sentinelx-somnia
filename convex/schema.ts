import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  tenants: defineTable({
    owner: s.string(),
    name: s.string(),
    createdAt: s.number()
  }).index('by_owner', ['owner']),

  monitors: defineTable({
    tenantId: s.id('tenants'),
    contractAddress: s.string(),
    guardianAddress: s.string(),
    routerAddress: s.string(),
    oracleKey: s.string(),
    protofireFeed: s.string(),
    diaFeed: s.string(),
    maxDeviationBps: s.number(),
    staleAfterSeconds: s.number(),
    status: s.optional(s.string()),
    createdAt: s.number()
  }).index('by_tenant', ['tenantId']),

  incidents: defineTable({
    monitorId: s.id('monitors'),
    occurredAt: s.number(),
    safe: s.boolean(),
    bothFresh: s.boolean(),
    action: s.string(),
    txHash: s.optional(s.string()),
    summary: s.optional(s.string()),
    details: s.optional(s.record(s.string(), s.any()))
  }).index('by_monitor', ['monitorId']),

  apiKeys: defineTable({
    tenantId: s.id('tenants'),
    keyHash: s.string(),
    createdAt: s.number(),
    label: s.string()
  }).index('by_tenant', ['tenantId'])
})
