import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const list = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, args) => {
    const keys = await ctx.db
      .query('apiKeys')
      .withIndex('by_tenant', q => q.eq('tenantId', args.tenantId))
      .collect()
    return keys.filter(key => !key.revokedAt)
  }
})

export const create = mutation({
  args: {
    tenantId: v.id('tenants'),
    hash: v.string(),
    label: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('apiKeys', {
      ...args,
      createdAt: Date.now()
    })
  }
})

export const remove = mutation({
  args: { apiKeyId: v.id('apiKeys') },
  handler: async (ctx, { apiKeyId }) => {
    const existing = await ctx.db.get(apiKeyId)
    if (!existing) return
    await ctx.db.patch(apiKeyId, { revokedAt: Date.now() })
  }
})

export const listAll = query({
  args: {},
  handler: async ctx => {
    const keys = await ctx.db.query('apiKeys').collect()
    return keys.filter(key => !key.revokedAt)
  }
})

export const findByHash = query({
  args: { hash: v.string() },
  handler: async (ctx, { hash }) => {
    return await ctx.db
      .query('apiKeys')
      .withIndex('by_hash', q => q.eq('hash', hash))
      .unique()
  }
})

export const markUsed = mutation({
  args: { apiKeyId: v.id('apiKeys') },
  handler: async (ctx, { apiKeyId }) => {
    await ctx.db.patch(apiKeyId, { lastUsedAt: Date.now() })
  }
})
