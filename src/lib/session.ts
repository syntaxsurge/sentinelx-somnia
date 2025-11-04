import { randomBytes } from 'crypto'

import { type SessionOptions } from 'iron-session'

const rawSecret = process.env.SESSION_SECRET

let resolvedSecret = rawSecret

if (!rawSecret || rawSecret.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set to a 32+ character string')
  }

  if (typeof globalThis.__sentinelxSessionSecret === 'string') {
    resolvedSecret = globalThis.__sentinelxSessionSecret
  } else {
    resolvedSecret = randomBytes(32).toString('hex')
    Object.defineProperty(globalThis, '__sentinelxSessionSecret', {
      value: resolvedSecret,
      writable: false,
      enumerable: false
    })
    console.warn(
      'SESSION_SECRET is not set; using an in-memory development secret. Set SESSION_SECRET in production.'
    )
  }
}

export const sessionOptions: SessionOptions = {
  cookieName: 'sentinelx_session',
  password: resolvedSecret!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
}

export type SessionUser = { address: `0x${string}` } | null
