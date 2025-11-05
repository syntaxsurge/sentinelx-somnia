import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const list = query({
  args: { monitorId: v.optional(v.union(v.id('monitors'), v.string())) },
  handler: async (ctx, args) => {
    if (args.monitorId) {
      const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
      if (!monitorId) {
        return []
      }
      return await ctx.db
        .query('incidents')
        .withIndex('by_monitor', q => q.eq('monitorId', monitorId))
        .order('desc')
        .collect()
    }
    return await ctx.db.query('incidents').order('desc').collect()
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

    const incidents = incidentLists.flat()
    incidents.sort((a, b) => b.occurredAt - a.occurredAt)

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
    details: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
    if (!monitorId) {
      throw new Error('Monitor not found')
    }
    return await ctx.db.insert('incidents', {
      ...args,
      monitorId,
      occurredAt: Date.now()
    })
  }
})
