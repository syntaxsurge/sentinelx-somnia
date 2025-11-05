'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useQuery } from 'convex/react'
import useSWR from 'swr'

import { IncidentTimeline } from '@/components/dashboard/IncidentTimeline'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { MonitorsTable } from '@/components/dashboard/MonitorsTable'
import { RunPolicyButton } from '@/components/run-policy-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'
import type { ChainConfig } from '@/lib/config'

const configFetcher = async (url: string): Promise<ChainConfig> => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Unable to load chain configuration')
  }
  return response.json()
}

function EmptyState({
  title,
  children,
  action
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <Card className='mx-auto max-w-md'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 text-sm text-muted-foreground'>
        {children}
        {action}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { toast } = useToast()
  const { user, loading } = useSession()
  const [simulating, setSimulating] = useState(false)
  const { data: chainConfig } = useSWR('/api/config/chain', configFetcher)
  const demoMode = chainConfig?.demoMode ?? false
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
  const openIncidents = useQuery(
    api.incidents.listOpen,
    tenant?._id ? { tenantId: tenant._id, status: 'open' } : 'skip'
  )
  const proposedActions = useQuery(
    api.actionIntents.listByState,
    tenant?._id ? { state: 'proposed', limit: 5 } : 'skip'
  )

  if (loading) {
    return (
      <EmptyState title='Loading workspace'>
        <p>Fetching tenant, monitors, and active incidents.</p>
      </EmptyState>
    )
  }

  if (!user?.address) {
    return (
      <EmptyState title='Connect wallet'>
        <p>
          Connect your Somnia wallet and sign-in with Ethereum to unlock
          SentinelX.
        </p>
      </EmptyState>
    )
  }

  if (!tenant) {
    return (
      <EmptyState
        title='Create a workspace'
        action={
          <Button asChild>
            <Link href='/onboarding'>Launch onboarding</Link>
          </Button>
        }
      >
        <p>
          SentinelX maps each tenant to your wallet. Create a workspace to
          register monitors and guardian policies.
        </p>
      </EmptyState>
    )
  }

  const monitorList = monitors ?? []
  const openIncidentList = openIncidents ?? []
  const actionQueue = proposedActions ?? []
  const timelineItems = timeline ?? []
  const latestIncident = timelineItems[0]

  const lastEvaluation = monitorList.reduce(
    (acc, monitor) => Math.max(acc, monitor.lastEvaluatedAt ?? 0),
    0
  )

  const kpis = [
    { title: 'Active monitors', value: String(monitorList.length) },
    {
      title: 'Open incidents',
      value: String(openIncidentList.length),
      hint: 'AI triage awaiting response'
    },
    {
      title: 'Pending actions',
      value: String(actionQueue.length),
      hint: 'Autonomous plans requiring approval'
    },
    {
      title: 'Last evaluation',
      value: lastEvaluation
        ? new Date(lastEvaluation).toLocaleTimeString()
        : 'Never',
      hint: 'Latest policy pass across monitors'
    }
  ]

  const handleSimulateIncident = async () => {
    setSimulating(true)
    try {
      const response = await fetch('/api/demo/simulate', { method: 'POST' })
      if (!response.ok) {
        const message = await response.json().catch(() => null)
        throw new Error(message?.error ?? 'Simulation failed')
      }
      toast({
        title: 'Incident simulated',
        description: 'Oracle price spiked. Refresh the dashboard in a few seconds.'
      })
    } catch (err) {
      toast({
        title: 'Simulation failed',
        description:
          err instanceof Error ? err.message : 'Check demo mode configuration.',
        variant: 'destructive'
      })
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className='space-y-6'>
      {demoMode ? (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-primary/40 bg-primary/5 px-5 py-4 text-sm'>
          <div className='space-y-1'>
            <p className='font-semibold text-foreground flex items-center gap-2'>
              <span className='inline-block h-2 w-2 rounded-full bg-primary animate-pulse' />
              Demo mode enabled
            </p>
            <p className='text-xs text-muted-foreground'>
              Trigger deterministic incidents and walk judges through the
              end-to-end flow.
            </p>
          </div>
          <Button asChild size='sm' variant='secondary'>
            <Link href='/docs#quickstart'>Demo quickstart</Link>
          </Button>
        </div>
      ) : null}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='space-y-1.5'>
          <h1 className='text-4xl font-bold tracking-tight text-foreground'>
            Operations Center
          </h1>
          <p className='text-sm text-muted-foreground max-w-2xl'>
            <span className='font-medium text-foreground'>{tenant.name}</span> ·{' '}
            {monitorList.length} active{' '}
            {monitorList.length === 1 ? 'monitor' : 'monitors'} · Guardian
            automation with AI co-pilot
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          {demoMode ? (
            <Button
              variant='outline'
              onClick={handleSimulateIncident}
              disabled={simulating}
              className='gap-2'
            >
              {simulating ? 'Simulating...' : 'Simulate incident'}
            </Button>
          ) : null}
          <RunPolicyButton />
          <Button asChild variant='default' className='gap-2'>
            <Link href='/monitors/new'>
              <span>New monitor</span>
            </Link>
          </Button>
        </div>
      </div>

      <KpiCards items={kpis} />

      <div className='grid gap-6 xl:grid-cols-3'>
        <Card className='xl:col-span-2 border-border/60'>
          <CardHeader className='flex flex-row items-start justify-between gap-4'>
            <div>
              <CardTitle className='text-xl'>Daily brief</CardTitle>
              <CardDescription className='mt-1'>
                Latest SentinelX intelligence from Somnia telemetry
              </CardDescription>
            </div>
            {latestIncident ? (
              <Badge
                variant={
                  latestIncident.severity === 'critical'
                    ? 'destructive'
                    : latestIncident.severity === 'high'
                      ? 'default'
                      : 'secondary'
                }
                className='uppercase'
              >
                {latestIncident.severity}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className='space-y-4'>
            {latestIncident ? (
              <>
                <div className='space-y-3 p-4 rounded-lg bg-muted/30 border border-border/60'>
                  <p className='text-base font-medium text-foreground leading-relaxed'>
                    {latestIncident.summary}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Opened{' '}
                    <span className='font-medium text-foreground'>
                      {new Date(latestIncident.openedAt).toLocaleString()}
                    </span>{' '}
                    · Status:{' '}
                    <span className='font-medium text-foreground capitalize'>
                      {latestIncident.status}
                    </span>
                  </p>
                </div>
                {latestIncident.advisoryTags?.length ? (
                  <div className='flex flex-wrap gap-2'>
                    {latestIncident.advisoryTags.map(tag => (
                      <Badge key={tag} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div>
                  <Button asChild size='sm' variant='default'>
                    <Link href='/incidents'>Review incident playbook</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className='text-center py-8'>
                <p className='text-sm font-medium text-foreground'>
                  All systems operational
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  No incidents detected in the last policy pass
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='border-border/60'>
          <CardHeader>
            <CardTitle className='text-xl'>Action queue</CardTitle>
            <CardDescription className='mt-1'>
              AI-suggested plans awaiting guardian approval
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {actionQueue.length ? (
              actionQueue.map(intent => (
                <div
                  key={intent._id}
                  className='rounded-lg border border-border/60 p-4 bg-card hover:bg-muted/30 transition-colors'
                >
                  <div className='flex items-start justify-between gap-2 mb-2'>
                    <span className='font-semibold text-foreground text-sm'>
                      {intent.plan?.name ?? 'Proposed action'}
                    </span>
                    <Badge variant='secondary' className='text-xs'>
                      Proposed
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground leading-relaxed mb-3'>
                    {intent.rationale}
                  </p>
                  <Button asChild size='sm' className='w-full' variant='default'>
                    <Link href='/actions'>Review &amp; approve</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className='text-center py-6'>
                <p className='text-xs text-muted-foreground'>
                  No pending actions. SentinelX will queue mitigations when
                  anomalies are detected.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
        <MonitorsTable monitors={monitorList} />
        <Card className='border-border/60'>
          <CardHeader>
            <CardTitle className='text-xl'>Workspace</CardTitle>
            <CardDescription className='mt-1'>
              Convex tenant, guardian, and automation metadata
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='p-3 rounded-lg bg-muted/30 border border-border/60'>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5'>
                  Owner
                </p>
                <p className='font-mono text-xs text-foreground break-all'>
                  {tenant.owner}
                </p>
              </div>
              <div className='p-3 rounded-lg bg-muted/30 border border-border/60'>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5'>
                  Created
                </p>
                <p className='text-sm text-foreground'>
                  {new Date(tenant.createdAt).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className='pt-2 space-y-3'>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                Run <code className='px-1.5 py-0.5 rounded bg-muted text-foreground text-xs'>pnpm policy:run</code> or schedule{' '}
                <code className='px-1.5 py-0.5 rounded bg-muted text-foreground text-xs'>/api/indexer/run</code> via cron to keep SentinelX AI aligned
                with Somnia telemetry.
              </p>
              <Button asChild variant='outline' className='w-full'>
                <Link href='/docs'>Implementation guide</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            Recent incidents
          </h2>
          <Link
            href='/incidents'
            className='text-sm font-medium text-primary hover:text-primary/80 transition-colors'
          >
            View all →
          </Link>
        </div>
        <IncidentTimeline incidents={timelineItems} />
      </section>
    </div>
  )
}
