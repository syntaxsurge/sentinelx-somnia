'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { useMutation, useQuery } from 'convex/react'

import { IncidentTimeline } from '@/components/dashboard/IncidentTimeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { api } from '@/convex/_generated/api'
import { type Id } from '@/convex/_generated/dataModel'
import { useToast } from '@/components/ui/use-toast'
import { useSession } from '@/hooks/useSession'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'secondary',
  paused: 'default',
  attention: 'destructive'
}

export default function MonitorDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useSession()
  const [deleting, setDeleting] = useState(false)
  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )
  const monitor = useQuery(
    api.monitors.get,
    params?.id ? { monitorId: params.id as Id<'monitors'> } : 'skip'
  )
  const incidents = useQuery(
    api.incidents.list,
    params?.id ? { monitorId: params.id as Id<'monitors'> } : 'skip'
  )
  const removeMonitor = useMutation(api.monitors.remove)

  if (!monitor) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='py-12 text-center text-sm text-muted-foreground'>
          Loading monitor…
        </CardContent>
      </Card>
    )
  }

  const incidentList = incidents ?? []

  const handleDelete = async () => {
    if (!tenant?._id) {
      toast({
        title: 'Workspace missing',
        description: 'Connect a tenant before deleting monitors.',
        variant: 'destructive'
      })
      return
    }

    const confirmed = window.confirm(
      'Delete this monitor? All incidents, telemetry, and action intents will be removed.'
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await removeMonitor({
        monitorId: monitor._id as Id<'monitors'>,
        tenantId: tenant._id as Id<'tenants'>
      })
      toast({
        title: 'Monitor deleted',
        description: 'All associated incidents and telemetry were removed.'
      })
      router.push('/monitors')
    } catch (error) {
      toast({
        title: 'Delete failed',
        description:
          error instanceof Error
            ? error.message
            : 'Unable to delete monitor.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='space-y-1'>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>
            Oracle monitor
          </p>
          <h1 className='text-3xl font-semibold tracking-tight'>
            {monitor.name}
          </h1>
          <p className='text-sm text-muted-foreground'>
            Pair {monitor.oracleKey} · Monitor ID{' '}
            <span className='font-mono text-xs'>{monitor._id}</span>
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge variant={statusVariant[monitor.status ?? ''] ?? 'default'}>
            {monitor.status ?? 'unknown'}
          </Badge>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete monitor'}
          </Button>
          <Button asChild variant='secondary'>
            <Link href='/monitors'>All monitors</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Dual-oracle wiring and GuardianHub enforcement for this contract.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 text-sm text-muted-foreground md:grid-cols-2'>
          <div>
            <p className='text-xs uppercase tracking-wide'>Guarded contract</p>
            <p className='font-mono text-xs'>{monitor.contractAddress}</p>
          </div>
          <div>
            <p className='text-xs uppercase tracking-wide'>Guardian hub</p>
            <p className='font-mono text-xs'>{monitor.guardianAddress}</p>
          </div>
          <div>
            <p className='text-xs uppercase tracking-wide'>SafeOracleRouter</p>
            <p className='font-mono text-xs'>{monitor.routerAddress}</p>
          </div>
          <div>
            <p className='text-xs uppercase tracking-wide'>Policy window</p>
            <p>
              ≤ {monitor.maxDeviationBps} bps deviation · stale after{' '}
              {monitor.staleAfterSeconds}s
            </p>
          </div>
          <div>
            <p className='text-xs uppercase tracking-wide'>Protofire feed</p>
            <p className='font-mono text-xs'>{monitor.protofireFeed}</p>
          </div>
          <div>
            <p className='text-xs uppercase tracking-wide'>DIA adapter</p>
            <p className='font-mono text-xs'>{monitor.diaFeed}</p>
          </div>
        </CardContent>
      </Card>

      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold tracking-tight'>
            Incident timeline
          </h2>
          <Link
            href='/dashboard'
            className='text-sm font-medium text-primary hover:underline'
          >
            Back to dashboard
          </Link>
        </div>
        <IncidentTimeline incidents={incidentList} />
      </section>
    </div>
  )
}
