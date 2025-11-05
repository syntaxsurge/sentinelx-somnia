import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const webhookKinds = ['slack', 'discord', 'http'] as const

export const list = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, { tenantId }) => {
    return await ctx.db
      .query('webhooks')
      .withIndex('by_tenant', q => q.eq('tenantId', tenantId))
      .order('desc')
      .collect()
  }
})

export const create = mutation({
  args: {
    tenantId: v.id('tenants'),
    label: v.string(),
    kind: v.string(),
    destination: v.string(),
    secret: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!webhookKinds.includes(args.kind as (typeof webhookKinds)[number])) {
      throw new Error('Unsupported webhook kind')
    }

    return await ctx.db.insert('webhooks', {
      ...args,
      createdAt: Date.now()
    })
  }
})

export const remove = mutation({
  args: { webhookId: v.id('webhooks') },
  handler: async (ctx, { webhookId }) => {
    await ctx.db.delete(webhookId)
  }
})
