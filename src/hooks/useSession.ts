'use client'

import { useCallback, useEffect, useState } from 'react'

type SessionValue = { address: `0x${string}` } | null

export function useSession() {
  const [user, setUser] = useState<SessionValue>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    const response = await fetch('/api/siwe/me', { cache: 'no-store' })
    if (!response.ok) {
      setUser(null)
      return
    }
    const data = await response.json()
    setUser(data.user ?? null)
  }, [])

  useEffect(() => {
    fetchSession().finally(() => setLoading(false))
  }, [fetchSession])

  const refresh = useCallback(async () => {
    await fetchSession()
  }, [fetchSession])

  return { user, loading, refresh }
}
