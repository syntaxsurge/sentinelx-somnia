import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

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
