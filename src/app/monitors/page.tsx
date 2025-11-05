'use client'

import Link from 'next/link'

import { useQuery } from 'convex/react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { MonitorsTable } from '@/components/dashboard/MonitorsTable'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'

export default function MonitorsPage() {
  const { user, loading } = useSession()
  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )
  const monitors = useQuery(
    api.monitors.listForTenant,
    tenant?._id ? { tenantId: tenant._id } : 'skip'
  )

  if (loading) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='py-12 text-center text-sm text-muted-foreground'>
          Loading monitors…
        </CardContent>
      </Card>
    )
  }

  if (!user?.address) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardHeader>
          <CardTitle>Connect wallet</CardTitle>
        </CardHeader>
        <CardContent className='text-sm text-muted-foreground'>
          Use the connect button to authenticate with RainbowKit and Somnia.
        </CardContent>
      </Card>
    )
  }

  if (!tenant) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardHeader>
          <CardTitle>Create a workspace</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm text-muted-foreground'>
          <p>
            We need a tenant to map your monitors. Launch onboarding to name
            your workspace and persist the tenant in Convex.
          </p>
          <Button asChild>
            <Link href='/onboarding'>Start onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const monitorList = monitors ?? []

  return (
    <div className='space-y-8'>
      <header className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight'>
            Monitors registry
          </h1>
          <p className='text-sm text-muted-foreground'>
            Register Somnia price feeds, guardian hubs, and SafeOracleRouter
            bindings for tenant <span className='font-mono'>{tenant.name}</span>.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button asChild>
            <Link href='/monitors/new'>Add monitor</Link>
          </Button>
          <Button asChild variant='secondary'>
            <Link href='/dashboard'>Back to dashboard</Link>
          </Button>
        </div>
      </header>

      <MonitorsTable monitors={monitorList} />

      <Card>
        <CardHeader>
          <CardTitle>Policy guidance</CardTitle>
          <CardDescription>
            Recommended thresholds and feed addresses for Somnia Shannon Testnet.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-sm text-muted-foreground'>
          <p>
            Use Protofire Chainlink feeds in tandem with DIA adapters. Set max
            deviation to 100 bps (1%) and stale after 180 seconds for volatile
            assets. Stablecoin pairs can tighten to 50 bps and 120 seconds.
          </p>
          <p>
            GuardianHub should be deployed once per organization. SafeOracleRouter
            can support multiple oracle keys—register each in the New Monitor
            form to enforce per-pair policy windows.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
