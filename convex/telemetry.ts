import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const record = mutation({
  args: {
    monitorId: v.union(v.id('monitors'), v.string()),
    ts: v.optional(v.number()),
    source: v.string(),
    windowSeconds: v.optional(v.number()),
    datapoint: v.any(),
    meta: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
    if (!monitorId) {
      throw new Error('Monitor not found')
    }

    const ts = args.ts ?? Date.now()

    return await ctx.db.insert('telemetry', {
      monitorId,
      ts,
      source: args.source,
      windowSeconds: args.windowSeconds,
      datapoint: args.datapoint,
      meta: args.meta
    })
  }
})

export const recentForMonitor = query({
  args: {
    monitorId: v.union(v.id('monitors'), v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
    if (!monitorId) {
      return []
    }

    const limit = Math.min(200, Math.max(10, args.limit ?? 50))

    return await ctx.db
      .query('telemetry')
      .withIndex('by_monitor_ts', q => q.eq('monitorId', monitorId))
      .order('desc')
      .take(limit)
  }
})
