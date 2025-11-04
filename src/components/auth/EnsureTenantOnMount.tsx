'use client'

import { useEffect } from 'react'

import { useMutation } from 'convex/react'

import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'

export function EnsureTenantOnMount() {
  const { user } = useSession()
  const ensureTenant = useMutation(api.tenants.ensureTenant)

  useEffect(() => {
    if (user?.address) {
      ensureTenant({ owner: user.address }).catch(() => {
        // swallow errors - ensureTenant idempotent
      })
    }
  }, [ensureTenant, user?.address])

  return null
}
