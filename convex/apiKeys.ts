import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const list = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('apiKeys')
      .withIndex('by_tenant', q => q.eq('tenantId', args.tenantId))
      .collect()
  }
})

export const create = mutation({
  args: {
    tenantId: v.id('tenants'),
    keyHash: v.string(),
    label: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('apiKeys', {
      ...args,
      createdAt: Date.now()
    })
  }
})

export const listAll = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query('apiKeys').collect()
  }
})
