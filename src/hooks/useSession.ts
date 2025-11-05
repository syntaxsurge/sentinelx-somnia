'use client'

import { useCallback } from 'react'

import useSWR from 'swr'

type SessionPayload = {
  isLoggedIn: boolean
  address: `0x${string}` | null
  chainId: number | null
}

const sessionFetcher = async (url: string): Promise<SessionPayload> => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    return { isLoggedIn: false, address: null, chainId: null }
  }
  const data = await response.json()
  return {
    isLoggedIn: Boolean(data?.isLoggedIn),
    address: data?.address ?? null,
    chainId: data?.chainId ?? null
  }
}

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

export function useAuthStatus(): SessionStatus {
  const { data, isLoading } = useSWR('/api/auth/me', sessionFetcher, {
    revalidateOnFocus: false
  })

  if (isLoading) return 'loading'
  return data?.isLoggedIn ? 'authenticated' : 'unauthenticated'
}

export function useSession() {
  const { data, isLoading, mutate } = useSWR('/api/auth/me', sessionFetcher, {
    revalidateOnFocus: false
  })

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  const user =
    data?.isLoggedIn && data.address
      ? { address: data.address, chainId: data.chainId }
      : null

  return {
    user,
    loading: isLoading,
    status: isLoading
      ? ('loading' as const)
      : data?.isLoggedIn
        ? ('authenticated' as const)
        : ('unauthenticated' as const),
    refresh
  }
}
