import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const upsertFromSiwe = mutation({
  args: { address: v.string() },
  handler: async (ctx, { address }) => {
    const normalized = address.toLowerCase()
    const existing = await ctx.db
      .query('users')
      .withIndex('by_address', q => q.eq('address', normalized))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { lastLoginAt: Date.now() })
      return existing._id
    }

    return await ctx.db.insert('users', {
      address: normalized,
      lastLoginAt: Date.now()
    })
  }
})

export const me = query({
  args: { address: v.string() },
  handler: async (ctx, { address }) => {
    const normalized = address.toLowerCase()
    return await ctx.db
      .query('users')
      .withIndex('by_address', q => q.eq('address', normalized))
      .unique()
  }
})
