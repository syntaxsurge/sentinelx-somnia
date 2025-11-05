'use client'

import Link from 'next/link'
import {
  Plus,
  ArrowLeft,
  Loader2,
  Wallet,
  Building2,
  Shield,
  Info
} from 'lucide-react'

import { useQuery } from 'convex/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-4 w-96' />
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-40' />
          </div>
        </div>
        <Card className='border-border/60'>
          <CardContent className='py-16 flex flex-col items-center'>
            <Loader2 className='h-12 w-12 text-primary animate-spin mb-4' />
            <p className='text-sm font-medium text-foreground'>
              Loading monitors
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Fetching your monitoring configuration...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user?.address) {
    return (
      <Card className='mx-auto max-w-lg border-border/60'>
        <CardHeader className='text-center space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20'>
            <Wallet className='h-8 w-8 text-primary' />
          </div>
          <CardTitle className='text-2xl'>Connect wallet</CardTitle>
          <CardDescription>
            Authenticate with RainbowKit to access your monitors
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-sm text-muted-foreground'>
            Use the connect button in the top right to sign in with your Somnia
            wallet.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!tenant) {
    return (
      <Card className='mx-auto max-w-lg border-border/60'>
        <CardHeader className='text-center space-y-4'>
          <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20'>
            <Building2 className='h-8 w-8 text-primary' />
          </div>
          <CardTitle className='text-2xl'>Create a workspace</CardTitle>
          <CardDescription>
            Set up your tenant to start monitoring Somnia contracts
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            We need a tenant to map your monitors. Launch onboarding to name
            your workspace and persist the tenant in Convex.
          </p>
          <Button asChild size='lg' className='w-full'>
            <Link href='/onboarding'>Start onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const monitorList = monitors ?? []

  return (
    <div className='space-y-6'>
      <header className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground'>
              Monitors
            </h1>
            {monitorList.length > 0 && (
              <Badge variant='secondary' className='text-sm'>
                {monitorList.length}
              </Badge>
            )}
          </div>
          <p className='text-sm text-muted-foreground max-w-2xl'>
            Register Somnia price feeds, guardian hubs, and SafeOracleRouter
            bindings for{' '}
            <span className='font-medium text-foreground'>{tenant.name}</span>
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' className='gap-2'>
            <Link href='/dashboard'>
              <ArrowLeft className='h-4 w-4' />
              Dashboard
            </Link>
          </Button>
          <Button asChild className='gap-2'>
            <Link href='/monitors/new'>
              <Plus className='h-4 w-4' />
              Add monitor
            </Link>
          </Button>
        </div>
      </header>

      <MonitorsTable monitors={monitorList} />

      <Card className='border-border/60 bg-muted/30'>
        <CardHeader>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0'>
              <Shield className='h-5 w-5 text-primary' />
            </div>
            <div className='flex-1'>
              <CardTitle className='text-xl'>Policy guidance</CardTitle>
              <CardDescription className='mt-1'>
                Recommended thresholds and feed addresses for Somnia Shannon
                Testnet
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3 text-sm text-muted-foreground leading-relaxed'>
            <div className='flex gap-3'>
              <Info className='h-4 w-4 text-primary flex-shrink-0 mt-0.5' />
              <p>
                Use Protofire Chainlink feeds in tandem with DIA adapters. Set
                max deviation to <strong className='text-foreground'>100 bps (1%)</strong> and stale after{' '}
                <strong className='text-foreground'>180 seconds</strong> for volatile assets. Stablecoin pairs can
                tighten to 50 bps and 120 seconds.
              </p>
            </div>
            <div className='flex gap-3'>
              <Info className='h-4 w-4 text-primary flex-shrink-0 mt-0.5' />
              <p>
                GuardianHub should be deployed once per organization.
                SafeOracleRouter can support multiple oracle keys—register each
                in the New Monitor form to enforce per-pair policy windows.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
