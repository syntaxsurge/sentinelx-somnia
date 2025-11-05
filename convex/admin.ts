import { action, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { TableNames } from './_generated/dataModel'

const DELETE_ORDER: TableNames[] = [
  'actionIntents',
  'telemetry',
  'incidents',
  'monitors',
  'apiKeys',
  'webhooks',
  'guardianOperators',
  'docChunks',
  'tenants',
  'users'
]

export const truncateBatch = internalMutation({
  args: {
    table: v.string()
  },
  handler: async (ctx, args) => {
    const table = args.table as TableNames
    const row = await ctx.db.query(table).first()
    if (!row) {
      return { deleted: 0 }
    }

    await ctx.db.delete(row._id)
    return { deleted: 1 }
  }
})

export const truncateAll = action({
  args: {
    secret: v.optional(v.string()),
    batchSize: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.CONVEX_RESET_TOKEN
    if (expectedSecret && args.secret !== expectedSecret) {
      throw new Error('Invalid reset token provided')
    }

    const batchSize = Math.min(Math.max(args.batchSize ?? 100, 1), 200)
    const summary: Record<string, number> = {}

    for (const table of DELETE_ORDER) {
      let deleted = 0
      while (true) {
        let batchDeleted = 0
        for (let i = 0; i < batchSize; i += 1) {
          const result = await ctx.runMutation(internal.admin.truncateBatch, {
            table
          })
          if (result.deleted === 0) {
            batchDeleted = 0
            break
          }
          batchDeleted += result.deleted
        }
        deleted += batchDeleted
        if (batchDeleted === 0) {
          break
        }
      }
      summary[table] = deleted
    }

    return summary
  }
})
