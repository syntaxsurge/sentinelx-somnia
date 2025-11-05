'use client'

import Link from 'next/link'
import { Plus, ArrowLeft, Wallet, Building2, Shield, Info } from 'lucide-react'

import { useQuery } from 'convex/react'

import { MonitorsSkeleton } from '@/components/skeletons/page-skeletons'
import { Badge } from '@/components/ui/badge'
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

  const tenantRequested = Boolean(user?.address)
  const tenantLoading = tenantRequested && tenant === undefined
  const monitorsLoading = Boolean(tenant?._id) && monitors === undefined
  const busy = loading || tenantLoading || monitorsLoading

  if (busy) {
    return <MonitorsSkeleton />
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
                Somnia exposes Chainlink (via Protofire) and DIA price feeds. Configure monitors with{' '}
                <strong className='text-foreground'>0.5–1.0% deviation</strong> and{' '}
                <strong className='text-foreground'>120–180 second freshness</strong> based on asset volatility; these
                match the published thresholds for Somnia feeds.
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
            <div className='flex gap-3'>
              <Info className='h-4 w-4 text-primary flex-shrink-0 mt-0.5' />
              <p>
                Need the exact numbers? See{' '}
                <Link
                  href='https://docs.somnia.network/developer/building-dapps/oracles/dia-price-feeds'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary underline'
                >
                  DIA price feeds on Somnia
                </Link>{' '}
                and{' '}
                <Link
                  href='https://docs.chain.link/data-feeds'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary underline'
                >
                  Chainlink data feed guidance
                </Link>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
