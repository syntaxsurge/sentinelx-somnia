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

export const getByOwner = query({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tenants')
      .withIndex('by_owner', q => q.eq('owner', args.owner))
      .first()
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

export const ensureTenant = mutation({
  args: {
    owner: v.string(),
    name: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('tenants')
      .withIndex('by_owner', q => q.eq('owner', args.owner))
      .first()

    if (existing) {
      if (args.name && existing.name !== args.name) {
        await ctx.db.patch(existing._id, { name: args.name })
      }
      return existing._id
    }

    return await ctx.db.insert('tenants', {
      owner: args.owner,
      name: args.name ?? args.owner.slice(0, 6),
      createdAt: Date.now()
    })
  }
})
