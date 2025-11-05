import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const ingest = mutation({
  args: {
    source: v.string(),
    chunk: v.string(),
    embedding: v.array(v.float64()),
    hash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (args.hash) {
      const existing = await ctx.db
        .query('docChunks')
        .withIndex('by_hash', q => q.eq('hash', args.hash))
        .first()

      if (existing) {
        await ctx.db.patch(existing._id, {
          chunk: args.chunk,
          embedding: args.embedding,
          source: args.source,
          createdAt: Date.now()
        })
        return existing._id
      }
    }

    return await ctx.db.insert('docChunks', {
      source: args.source,
      chunk: args.chunk,
      hash: args.hash,
      embedding: args.embedding,
      createdAt: Date.now()
    })
  }
})

export const search = query({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query('docChunks')
      .order('desc')
      .take(args.limit ?? 200)

    return chunks
  }
})
