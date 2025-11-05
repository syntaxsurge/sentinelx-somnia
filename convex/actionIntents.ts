import { v } from 'convex/values'

import { internalMutation, mutation, query } from './_generated/server'

export const listForIncident = query({
  args: { incidentId: v.id('incidents') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('actionIntents')
      .withIndex('by_incident', q => q.eq('incidentId', args.incidentId))
      .order('desc')
      .collect()
  }
})

export const listByState = query({
  args: { state: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!args.state) {
      return await ctx.db
        .query('actionIntents')
        .order('desc')
        .take(args.limit ?? 50)
    }

  return await ctx.db
    .query('actionIntents')
    .withIndex('by_state', q => q.eq('state', args.state!))
    .order('desc')
    .take(args.limit ?? 50)
  }
})

export const get = query({
  args: { intentId: v.id('actionIntents') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.intentId)
  }
})

export const create = mutation({
  args: {
    incidentId: v.id('incidents'),
    proposer: v.string(),
    plan: v.any(),
    rationale: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('actionIntents', {
      incidentId: args.incidentId,
      proposedAt: Date.now(),
      proposer: args.proposer,
      plan: args.plan,
      rationale: args.rationale,
      state: 'proposed'
    })
  }
})

export const setState = mutation({
  args: {
    intentId: v.id('actionIntents'),
    state: v.string(),
    actor: v.optional(v.string()),
    txHash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      state: args.state
    }

    const now = Date.now()

    if (args.state === 'approved') {
      patch.approvedAt = now
      patch.approvedBy = args.actor
    } else if (args.state === 'executed') {
      patch.executedAt = now
      patch.txHash = args.txHash
    } else if (args.state === 'rejected') {
      patch.approvedAt = now
      patch.approvedBy = args.actor
    }

    await ctx.db.patch(args.intentId, patch)
  }
})

export const removeForIncident = internalMutation({
  args: { incidentId: v.id('incidents') },
  handler: async (ctx, args) => {
    const toDelete = await ctx.db
      .query('actionIntents')
      .withIndex('by_incident', q => q.eq('incidentId', args.incidentId))
      .collect()

    await Promise.all(toDelete.map(intent => ctx.db.delete(intent._id)))
  }
})
