import { internalMutation } from './_generated/server'
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

export const truncateAll = internalMutation({
  args: {},
  handler: async ctx => {
    const summary: Record<string, number> = {}

    for (const table of DELETE_ORDER) {
      const rows = await ctx.db.query(table).collect()
      let deleted = 0

      for (const row of rows) {
        await ctx.db.delete(row._id)
        deleted += 1
      }

      summary[table] = deleted
    }

    return summary
  }
})
