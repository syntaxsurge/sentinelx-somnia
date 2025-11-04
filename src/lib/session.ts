import { type SessionOptions } from 'iron-session'

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be set to a 32+ character string')
}

export const sessionOptions: SessionOptions = {
  cookieName: 'sentinelx_session',
  password: sessionSecret,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
}

export type SessionUser = { address: `0x${string}` } | null
