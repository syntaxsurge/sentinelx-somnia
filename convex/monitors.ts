import { internalMutation, mutation, query } from 'convex/server'
import { v } from 'convex/values'

export const list = query({
  args: { tenantId: v.optional(v.union(v.id('tenants'), v.string())) },
  handler: async (ctx, args) => {
    if (args.tenantId) {
      const tenantId = ctx.db.normalizeId('tenants', args.tenantId)
      return await ctx.db
        .query('monitors')
        .withIndex('by_tenant', q => q.eq('tenantId', tenantId))
        .collect()
    }
    return await ctx.db.query('monitors').collect()
  }
})

export const create = mutation({
  args: {
    tenantId: v.union(v.id('tenants'), v.string()),
    contractAddress: v.string(),
    guardianAddress: v.string(),
    routerAddress: v.string(),
    oracleKey: v.string(),
    protofireFeed: v.string(),
    diaFeed: v.string(),
    maxDeviationBps: v.number(),
    staleAfterSeconds: v.number()
  },
  handler: async (ctx, args) => {
    const tenantId = ctx.db.normalizeId('tenants', args.tenantId)
    const { tenantId: _ignored, ...rest } = args

    return await ctx.db.insert('monitors', {
      ...rest,
      tenantId,
      status: 'active',
      createdAt: Date.now()
    })
  }
})

export const updateStatus = internalMutation({
  args: {
    monitorId: v.id('monitors'),
    status: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.monitorId, { status: args.status })
  }
})

export const setStatus = mutation({
  args: {
    monitorId: v.union(v.id('monitors'), v.string()),
    status: v.string()
  },
  handler: async (ctx, args) => {
    const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
    await ctx.db.patch(monitorId, { status: args.status })
  }
})
