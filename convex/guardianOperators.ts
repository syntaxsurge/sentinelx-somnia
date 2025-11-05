import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, { tenantId }) => {
    return await ctx.db
      .query('guardianOperators')
      .withIndex('by_tenant', q => q.eq('tenantId', tenantId))
      .order('desc')
      .collect()
  }
})

export const add = mutation({
  args: {
    tenantId: v.id('tenants'),
    address: v.string(),
    role: v.optional(v.string()),
    note: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('guardianOperators', {
      ...args,
      createdAt: Date.now()
    })
  }
})

export const remove = mutation({
  args: { guardianId: v.id('guardianOperators') },
  handler: async (ctx, { guardianId }) => {
    await ctx.db.delete(guardianId)
  }
})
