import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tenants: defineTable({
    owner: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index('by_owner', ['owner']),

  monitors: defineTable({
    tenantId: v.id('tenants'),
    name: v.string(),
    type: v.string(), // price, latency, log_volume, gas_spike, custom
    status: v.string(), // active, paused, attention
    params: v.optional(v.any()),
    contractAddress: v.string(),
    guardianAddress: v.string(),
    routerAddress: v.string(),
    oracleKey: v.string(),
    protofireFeed: v.string(),
    diaFeed: v.string(),
    maxDeviationBps: v.number(),
    staleAfterSeconds: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastEvaluatedAt: v.optional(v.number())
  })
    .index('by_tenant', ['tenantId'])
    .index('by_status', ['status']),

  telemetry: defineTable({
    monitorId: v.id('monitors'),
    ts: v.number(),
    source: v.string(), // protofire, dia, guardian, policy, indexer
    windowSeconds: v.optional(v.number()),
    datapoint: v.any(),
    meta: v.optional(v.any())
  }).index('by_monitor_ts', ['monitorId', 'ts']),

  incidents: defineTable({
    monitorId: v.id('monitors'),
    openedAt: v.number(),
    closedAt: v.optional(v.number()),
    status: v.string(), // open, acknowledged, mitigated, closed
    severity: v.string(), // low, medium, high, critical
    summary: v.string(),
    details: v.optional(v.any()),
    rootCause: v.optional(v.string()),
    mitigations: v.optional(v.array(v.string())),
    acknowledgedAt: v.optional(v.number()),
    acknowledgedBy: v.optional(v.string()),
    lastUpdatedAt: v.number(),
    safe: v.optional(v.boolean()),
    bothFresh: v.optional(v.boolean()),
    action: v.optional(v.string()),
    txHash: v.optional(v.string()),
    advisoryTags: v.optional(v.array(v.string()))
  })
    .index('by_monitor', ['monitorId'])
    .index('by_status', ['status'])
    .index('by_severity', ['severity']),

  actionIntents: defineTable({
    incidentId: v.id('incidents'),
    proposedAt: v.number(),
    proposer: v.string(), // agent name or wallet
    plan: v.any(),
    state: v.string(), // proposed, approved, executed, rejected
    rationale: v.string(),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.string()),
    executedAt: v.optional(v.number()),
    txHash: v.optional(v.string())
  })
    .index('by_incident', ['incidentId'])
    .index('by_state', ['state']),

  docChunks: defineTable({
    source: v.string(),
    chunk: v.string(),
    hash: v.optional(v.string()),
    embedding: v.array(v.float64()),
    createdAt: v.number()
  })
    .index('by_source', ['source'])
    .index('by_hash', ['hash']),

  apiKeys: defineTable({
    tenantId: v.id('tenants'),
    hash: v.string(),
    label: v.string(),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number())
  })
    .index('by_tenant', ['tenantId'])
    .index('by_hash', ['hash']),

  webhooks: defineTable({
    tenantId: v.id('tenants'),
    label: v.string(),
    kind: v.string(),
    destination: v.string(),
    secret: v.optional(v.string()),
    createdAt: v.number()
  }).index('by_tenant', ['tenantId']),

  guardianOperators: defineTable({
    tenantId: v.id('tenants'),
    address: v.string(),
    role: v.optional(v.string()),
    note: v.optional(v.string()),
    createdAt: v.number()
  }).index('by_tenant', ['tenantId']),

  users: defineTable({
    address: v.string(),
    lastLoginAt: v.number(),
    nickname: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    roles: v.optional(v.array(v.string()))
  }).index('by_address', ['address'])
})
