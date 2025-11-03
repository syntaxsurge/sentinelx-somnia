import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tenants: defineTable({
    owner: v.string(),
    name: v.string(),
    createdAt: v.number()
  }).index('by_owner', ['owner']),

  monitors: defineTable({
    tenantId: v.id('tenants'),
    contractAddress: v.string(),
    guardianAddress: v.string(),
    routerAddress: v.string(),
    oracleKey: v.string(),
    protofireFeed: v.string(),
    diaFeed: v.string(),
    maxDeviationBps: v.number(),
    staleAfterSeconds: v.number(),
    status: v.optional(v.string()),
    createdAt: v.number()
  }).index('by_tenant', ['tenantId']),

  incidents: defineTable({
    monitorId: v.id('monitors'),
    occurredAt: v.number(),
    safe: v.boolean(),
    bothFresh: v.boolean(),
    action: v.string(),
    txHash: v.optional(v.string()),
    summary: v.optional(v.string()),
    details: v.optional(v.any())
  }).index('by_monitor', ['monitorId']),

  apiKeys: defineTable({
    tenantId: v.id('tenants'),
    keyHash: v.string(),
    createdAt: v.number(),
    label: v.string()
  }).index('by_tenant', ['tenantId'])
})
