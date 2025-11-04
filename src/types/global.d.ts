declare global {
  var __sentinelxSessionSecret: string | undefined
}

declare module 'fake-indexeddb/auto'

export {}
