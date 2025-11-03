import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query('tenants').collect()
  }
})

export const byOwner = query({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tenants')
      .withIndex('by_owner', q => q.eq('owner', args.owner))
      .collect()
  }
})

export const create = mutation({
  args: {
    owner: v.string(),
    name: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('tenants')
      .withIndex('by_owner', q => q.eq('owner', args.owner))
      .first()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert('tenants', {
      owner: args.owner,
      name: args.name,
      createdAt: Date.now()
    })
  }
})
