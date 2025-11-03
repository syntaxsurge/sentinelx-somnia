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
