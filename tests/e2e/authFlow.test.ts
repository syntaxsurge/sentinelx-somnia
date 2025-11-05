import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SiweMessage } from 'siwe'
import { privateKeyToAccount } from 'viem/accounts'

process.env.SESSION_SECRET ||= '0123456789abcdef0123456789abcdef'
process.env.NEXT_PUBLIC_BASE_URL ||= 'http://localhost:3000'
process.env.CONVEX_DEPLOYMENT ||= 'https://example.convex.cloud'

import { GET as getNonce } from '@/app/api/auth/nonce/route'
import { POST as postVerify } from '@/app/api/auth/verify/route'
import { GET as getSession } from '@/app/api/auth/me/route'
import { POST as postLogout } from '@/app/api/auth/logout/route'

class MemoryCookieStore {
  private store = new Map<string, string>()

  get(name: string) {
    const value = this.store.get(name)
    if (!value) return undefined
    return { name, value }
  }

  getAll() {
    return Array.from(this.store.entries()).map(([name, value]) => ({
      name,
      value
    }))
  }

  set(name: string, value: string) {
    this.store.set(name, value)
  }

  delete(name: string) {
    this.store.delete(name)
  }

  has(name: string) {
    return this.store.has(name)
  }
}

const mutationSpy = vi.fn()

vi.mock('convex/browser', () => {
  return {
    ConvexHttpClient: class {
      mutation = mutationSpy
    }
  }
})

let cookieStore: MemoryCookieStore
let cookieJar: Map<string, string>

vi.mock('next/headers', () => ({
  cookies: () => cookieStore
}))

const syncCookieJarFromResponse = (response: Response) => {
  const setCookies =
    ((response.headers as any).getSetCookie?.() as string[] | undefined) ??
    (response.headers.get('set-cookie')
      ? [response.headers.get('set-cookie') as string]
      : [])

  for (const cookieString of setCookies) {
    const [pair] = cookieString.split(';')
    const [name, ...valueParts] = pair.split('=')
    if (!name) continue
    const value = valueParts.join('=')
    if (value) {
      cookieJar.set(name, value)
      cookieStore.set(name, value)
    } else {
      cookieJar.delete(name)
      cookieStore.delete(name)
    }
  }
}

const buildRequestWithCookies = (input: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  if (cookieJar.size) {
    headers.set(
      'cookie',
      Array.from(cookieJar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; ')
    )
  }

  return new Request(input, {
    ...init,
    headers
  })
}

const testPrivateKey =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const account = privateKeyToAccount(testPrivateKey)

describe('/api/auth flow', () => {

  beforeEach(() => {
    cookieStore = new MemoryCookieStore()
    cookieJar = new Map()
    mutationSpy.mockReset()
    process.env.SESSION_SECRET = '0123456789abcdef0123456789abcdef'
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
  })

  it('completes SIWE sign-in, session lookup, and logout', async () => {
    const nonceResponse = await getNonce(
      buildRequestWithCookies('http://localhost/api/auth/nonce')
    )
    expect(nonceResponse.status).toBe(200)
    syncCookieJarFromResponse(nonceResponse)
    const nonce = await nonceResponse.text()
    expect(nonce.length).toBeGreaterThan(0)

    const message = new SiweMessage({
      domain: 'localhost:3000',
      address: account.address,
      statement: 'Sign in to SentinelX.',
      uri: 'http://localhost:3000',
      version: '1',
      chainId: 50312,
      nonce
    })

    const signature = await account.signMessage({
      message: message.prepareMessage()
    })

    const verifyResponse = await postVerify(
      buildRequestWithCookies('http://localhost/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature })
      })
    )

    expect(verifyResponse.status).toBe(200)
    syncCookieJarFromResponse(verifyResponse)
    expect(mutationSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ address: account.address })
    )

    const meResponse = await getSession()
    const mePayload = await meResponse.json()
    expect(mePayload.isLoggedIn).toBe(true)
    expect(mePayload.address).toBe(account.address)

    const logoutResponse = await postLogout(
      buildRequestWithCookies('http://localhost/api/auth/logout', {
        method: 'POST'
      })
    )
    expect(logoutResponse.status).toBe(200)
    syncCookieJarFromResponse(logoutResponse)

    const meAfterLogout = await getSession()
    const meAfterPayload = await meAfterLogout.json()
    expect(meAfterPayload.isLoggedIn).toBe(false)
  })
})
