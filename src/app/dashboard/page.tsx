'use client'

import Link from 'next/link'

import { useQuery } from 'convex/react'

import { RunPolicyButton } from '@/components/run-policy-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IncidentTimeline } from '@/components/dashboard/IncidentTimeline'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { MonitorsTable } from '@/components/dashboard/MonitorsTable'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'

export default function DashboardPage() {
  const { user, loading } = useSession()
  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )
  const monitors = useQuery(
    api.monitors.listForTenant,
    tenant?._id ? { tenantId: tenant._id } : 'skip'
  )
  const timeline = useQuery(
    api.incidents.timelineForTenant,
    tenant?._id ? { tenantId: tenant._id, limit: 10 } : 'skip'
  )

  if (loading) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='py-12 text-center text-sm text-muted-foreground'>
          Loading your workspace…
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
        <CardContent className='space-y-4 text-sm text-muted-foreground'>
          <p>
            Connect your Somnia wallet and complete SIWE to unlock the Guardian
            operations center.
          </p>
          <p>Use the connect button in the header to start.</p>
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
        <CardContent className='space-y-4 text-sm text-muted-foreground'>
          <p>
            SentinelX maps each tenant to your wallet address. Create one to
            start registering monitors, API keys, and incident webhooks.
          </p>
          <Button asChild>
            <Link href='/onboarding'>Launch onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const monitorList = monitors ?? []
  const timelineItems = timeline ?? []

  const attentionCount = monitorList.filter(
    monitor => monitor.status === 'attention'
  ).length
  const uniqueGuardians = new Set(
    monitorList.map(monitor => monitor.guardianAddress)
  ).size

  return (
    <div className='space-y-10'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight'>
            Somnia operations
          </h1>
          <p className='text-sm text-muted-foreground'>
            Tenant <span className='font-mono'>{tenant.name}</span> on Somnia
            Shannon Testnet. Stay ahead of oracle drift, guardian pauses, and
            incident triage.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <RunPolicyButton />
          <Link href='/monitors/new'>
            <Button variant='secondary'>New monitor</Button>
          </Link>
        </div>
      </div>

      <KpiCards
        items={[
          { title: 'Active monitors', value: String(monitorList.length) },
          {
            title: 'Attention required',
            value: String(attentionCount),
            hint: 'Unsafe status across active monitors'
          },
          {
            title: 'Unique guardians',
            value: String(uniqueGuardians),
            hint: 'GuardianHub operators bound to monitors'
          },
          {
            title: 'Recent incidents',
            value: String(timelineItems.length),
            hint: 'Last 10 evaluations recorded'
          }
        ]}
      />

      <div className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
        <MonitorsTable monitors={monitorList} />
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Workspace</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-muted-foreground'>
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                Owner address
              </p>
              <p className='font-mono text-sm'>{tenant.owner}</p>
            </div>
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                Created
              </p>
              <p>{new Date(tenant.createdAt).toLocaleString()}</p>
            </div>
            <p>
              Register monitors to cover every guardable contract. Run the
              policy agent on demand or wire it into Vercel cron for continuous
              protection.
            </p>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/docs'>Implementation guide</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold tracking-tight'>
            Recent incidents
          </h2>
          <Link
            href='/monitors'
            className='text-sm font-medium text-primary hover:underline'
          >
            Browse monitors
          </Link>
        </div>
        <IncidentTimeline incidents={timelineItems} />
      </section>
    </div>
  )
}
