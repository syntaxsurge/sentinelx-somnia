import { v } from 'convex/values'

import { internalMutation, mutation, query } from './_generated/server'

export const list = query({
  args: { monitorId: v.optional(v.union(v.id('monitors'), v.string())) },
  handler: async (ctx, args) => {
    if (args.monitorId) {
      const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
      if (!monitorId) {
        return []
      }
      const rows = await ctx.db
        .query('incidents')
        .withIndex('by_monitor', q => q.eq('monitorId', monitorId))
        .order('desc')
        .collect()
      return rows
    }
    return await ctx.db.query('incidents').order('desc').collect()
  }
})

export const listOpen = query({
  args: {
    tenantId: v.id('tenants'),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const monitors = await ctx.db
      .query('monitors')
      .withIndex('by_tenant', q => q.eq('tenantId', args.tenantId))
      .collect()

    const monitorIds = monitors.map(m => m._id)
    if (monitorIds.length === 0) return []

    const status = args.status ?? 'open'

    const incidents = await Promise.all(
      monitorIds.map(async monitorId => {
        return await ctx.db
          .query('incidents')
          .withIndex('by_monitor', q => q.eq('monitorId', monitorId))
          .filter(q => q.eq(q.field('status'), status))
          .order('desc')
          .take(20)
      })
    )

    return incidents.flat().sort((a, b) => b.openedAt - a.openedAt)
  }
})

export const listForTenant = query({
  args: {
    tenantId: v.id('tenants'),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const monitors = await ctx.db
      .query('monitors')
      .withIndex('by_tenant', q => q.eq('tenantId', args.tenantId))
      .collect()

    if (monitors.length === 0) return []

    const incidents = await Promise.all(
      monitors.map(monitor =>
        ctx.db
          .query('incidents')
          .withIndex('by_monitor', q => q.eq('monitorId', monitor._id))
          .order('desc')
          .take(args.limit ?? 100)
      )
    )

    return incidents.flat().sort((a, b) => b.openedAt - a.openedAt)
  }
})

export const timelineForTenant = query({
  args: {
    tenantId: v.id('tenants'),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { tenantId, limit }) => {
    const monitors = await ctx.db
      .query('monitors')
      .withIndex('by_tenant', q => q.eq('tenantId', tenantId))
      .collect()

    if (monitors.length === 0) return []

    const perMonitorLimit = Math.max(3, Math.ceil((limit ?? 10) / monitors.length))

    const incidentLists = await Promise.all(
      monitors.map(async monitor => {
        const rows = await ctx.db
          .query('incidents')
          .withIndex('by_monitor', q => q.eq('monitorId', monitor._id))
          .order('desc')
          .take(perMonitorLimit)
        return rows
      })
    )

    const incidents = incidentLists.flat().sort((a, b) => b.openedAt - a.openedAt)
    return incidents.slice(0, limit ?? 10)
  }
})

export const record = mutation({
  args: {
    monitorId: v.union(v.id('monitors'), v.string()),
    safe: v.boolean(),
    bothFresh: v.boolean(),
    action: v.string(),
    txHash: v.optional(v.string()),
    summary: v.optional(v.string()),
    details: v.optional(v.any()),
    severity: v.optional(v.string()),
    advisoryTags: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
    if (!monitorId) {
      throw new Error('Monitor not found')
    }

    const now = Date.now()

    const severity =
      args.severity ??
      (args.safe
        ? 'low'
        : args.bothFresh
          ? 'critical'
          : 'high')

    const rootCause = args.safe
      ? 'Oracle validation within expected thresholds.'
      : args.bothFresh
        ? 'Deviation threshold breached between Protofire and DIA price feeds.'
        : 'At least one oracle feed exceeded the allowed staleness window.'

    const mitigations = args.safe
      ? []
      : args.bothFresh
        ? [
            'Pause dependent contracts via GuardianHub.',
            'Check upstream Protofire and DIA feeds for anomalies.',
            'Re-run SentinelX policy once external feed health is confirmed.'
          ]
        : [
            'Refresh oracle adapters and confirm feed heartbeat.',
            'Consider switching to the freshest feed temporarily via GuardianHub.',
            'Increase alerting on upstream keeper jobs servicing the stale feed.'
          ]

    const advisoryTags =
      args.advisoryTags ??
      [
        args.safe ? 'status:safe' : 'status:unsafe',
        args.bothFresh ? 'feeds:fresh' : 'feeds:stale',
        `action:${args.action}`
      ]

    type IncidentInsert = {
      monitorId: typeof monitorId
      openedAt: number
      closedAt?: number
      status: string
      severity: string
      summary: string
      details?: unknown
      rootCause?: string
      mitigations?: string[]
      lastUpdatedAt: number
      safe?: boolean
      bothFresh?: boolean
      action?: string
      txHash?: string
      advisoryTags?: string[]
    }

    const incidentPayload: IncidentInsert = {
      monitorId,
      openedAt: now,
      status: args.safe ? 'closed' : 'open',
      severity,
      summary: args.summary ?? 'SentinelX evaluation result',
      details: args.details,
      rootCause,
      mitigations,
      lastUpdatedAt: now,
      safe: args.safe,
      bothFresh: args.bothFresh,
      action: args.action,
      txHash: args.txHash,
      advisoryTags
    }

    if (args.safe) {
      incidentPayload.closedAt = now
    }

    return await ctx.db.insert('incidents', incidentPayload)
  }
})

export const acknowledge = mutation({
  args: {
    incidentId: v.id('incidents'),
    actor: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      status: 'acknowledged',
      acknowledgedAt: Date.now(),
      acknowledgedBy: args.actor,
      lastUpdatedAt: Date.now()
    })
  }
})

export const close = mutation({
  args: {
    incidentId: v.id('incidents'),
    actor: v.string(),
    txHash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.incidentId, {
      status: 'closed',
      closedAt: Date.now(),
      acknowledgedBy: args.actor,
      acknowledgedAt: Date.now(),
      txHash: args.txHash,
      lastUpdatedAt: Date.now()
    })
  }
})

export const resetForMonitor = internalMutation({
  args: { monitorId: v.id('monitors') },
  handler: async (ctx, args) => {
    const incidents = await ctx.db
      .query('incidents')
      .withIndex('by_monitor', q => q.eq('monitorId', args.monitorId))
      .collect()

    await Promise.all(incidents.map(incident => ctx.db.delete(incident._id)))
  }
})
export const get = query({
  args: { incidentId: v.id('incidents') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.incidentId)
  }
})
