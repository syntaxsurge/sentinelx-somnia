declare global {
  // eslint-disable-next-line no-var
  var __sentinelxSessionSecret: string | undefined
}

declare module 'fake-indexeddb/auto'

export {}
