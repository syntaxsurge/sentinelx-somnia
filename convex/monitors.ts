import { v } from 'convex/values'

import { getCanonicalAddresses } from './config'
import { internalMutation, mutation, query } from './_generated/server'

export const list = query({
  args: { tenantId: v.optional(v.union(v.id('tenants'), v.string())) },
  handler: async (ctx, args) => {
    if (args.tenantId) {
      const tenantId = ctx.db.normalizeId('tenants', args.tenantId)
      if (!tenantId) {
        return []
      }
      return await ctx.db
        .query('monitors')
        .withIndex('by_tenant', q => q.eq('tenantId', tenantId))
        .collect()
    }
    return await ctx.db.query('monitors').collect()
  }
})

export const create = mutation({
  args: {
    tenantId: v.union(v.id('tenants'), v.string()),
    name: v.string(),
    type: v.string(),
    params: v.optional(v.any()),
    contractAddress: v.string(),
    guardianAddress: v.string(),
    routerAddress: v.string(),
    oracleKey: v.string(),
    protofireFeed: v.string(),
    diaFeed: v.string(),
    maxDeviationBps: v.number(),
    staleAfterSeconds: v.number()
  },
  handler: async (ctx, args) => {
    const tenantId = ctx.db.normalizeId('tenants', args.tenantId)
    if (!tenantId) {
      throw new Error('Tenant not found')
    }

    const canonical = getCanonicalAddresses()
    const canonicalFeed = canonical.feeds[args.oracleKey]
    if (!canonicalFeed) {
      throw new Error(`Oracle ${args.oracleKey} is not configured`)
    }

    const lower = <T extends string>(value: T) => value.toLowerCase()

    const values = {
      contractAddress: lower(args.contractAddress),
      guardianAddress: lower(canonical.guardianHub),
      routerAddress: lower(canonical.oracleRouter),
      protofireFeed: lower(canonicalFeed.protofire),
      diaFeed: lower(canonicalFeed.dia)
    }

    const { tenantId: _ignored, ...rest } = args

    const params = {
      ...(rest.params ?? {}),
      agentInbox: lower(canonical.agentInbox),
      demoOracle: canonical.demoOracle,
      demoPausable: canonical.demoPausable
    }

    return await ctx.db.insert('monitors', {
      ...rest,
      params,
      contractAddress: values.contractAddress,
      guardianAddress: values.guardianAddress,
      routerAddress: values.routerAddress,
      protofireFeed: values.protofireFeed,
      diaFeed: values.diaFeed,
      tenantId,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  }
})

export const listForTenant = query({
  args: { tenantId: v.id('tenants') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('monitors')
      .withIndex('by_tenant', q => q.eq('tenantId', args.tenantId))
      .collect()
  }
})

export const get = query({
  args: { monitorId: v.id('monitors') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.monitorId)
  }
})

export const updateStatus = internalMutation({
  args: {
    monitorId: v.id('monitors'),
    status: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.monitorId, {
      status: args.status,
      updatedAt: Date.now()
    })
  }
})

export const setStatus = mutation({
  args: {
    monitorId: v.union(v.id('monitors'), v.string()),
    status: v.string()
  },
  handler: async (ctx, args) => {
    const monitorId = ctx.db.normalizeId('monitors', args.monitorId)
    if (!monitorId) {
      throw new Error('Monitor not found')
    }
    await ctx.db.patch(monitorId, {
      status: args.status,
      updatedAt: Date.now()
    })
  }
})

export const updateEvaluation = mutation({
  args: {
    monitorId: v.id('monitors'),
    evaluatedAt: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.monitorId, {
      lastEvaluatedAt: args.evaluatedAt,
      updatedAt: Date.now()
    })
  }
})
