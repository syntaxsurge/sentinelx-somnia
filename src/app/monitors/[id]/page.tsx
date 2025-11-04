'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useQuery } from 'convex/react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/convex/_generated/api'

export default function MonitorDetailPage() {
  const params = useParams<{ id: string }>()
  const monitor = useQuery(
    api.monitors.get,
    params?.id ? { monitorId: params.id as any } : 'skip'
  )
  const incidents = useQuery(
    api.incidents.list,
    params?.id ? { monitorId: params.id } : 'skip'
  )

  if (!monitor) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Loading monitor…
      </p>
    )
  }

  const incidentList = incidents ?? []

  return (
    <div className='space-y-8 py-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-semibold'>{monitor.oracleKey}</h1>
          <p className='text-sm text-muted-foreground'>
            Monitor ID: {monitor._id}
          </p>
        </div>
        <Badge
          variant={monitor.status === 'attention' ? 'destructive' : 'default'}
        >
          {monitor.status ?? 'unknown'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-2 text-sm text-muted-foreground md:grid-cols-2'>
          <div>
            <strong>Contract</strong>
            <p className='font-mono text-xs'>{monitor.contractAddress}</p>
          </div>
          <div>
            <strong>Guardian</strong>
            <p className='font-mono text-xs'>{monitor.guardianAddress}</p>
          </div>
          <div>
            <strong>SafeOracleRouter</strong>
            <p className='font-mono text-xs'>{monitor.routerAddress}</p>
          </div>
          <div>
            <strong>Protofire feed</strong>
            <p className='font-mono text-xs'>{monitor.protofireFeed}</p>
          </div>
          <div>
            <strong>DIA adapter</strong>
            <p className='font-mono text-xs'>{monitor.diaFeed}</p>
          </div>
          <div>
            <strong>Policy</strong>
            <p>
              Deviation ≤ {monitor.maxDeviationBps} bps · stale after{' '}
              {monitor.staleAfterSeconds}s
            </p>
          </div>
        </CardContent>
      </Card>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold'>Recent incidents</h2>
          <Link
            href='/dashboard'
            className='text-sm text-primary hover:underline'
          >
            Back to dashboard
          </Link>
        </div>
        <div className='space-y-3'>
          {incidentList.length === 0 ? (
            <p className='rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground'>
              No incidents logged yet. Run the policy evaluation to generate
              one.
            </p>
          ) : (
            incidentList.map(incident => (
              <Card key={incident._id}>
                <CardContent className='flex flex-col gap-2 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between'>
                  <div className='space-y-1'>
                    <p className='text-foreground'>
                      {incident.summary ?? 'No summary provided.'}
                    </p>
                    <div className='flex flex-wrap items-center gap-3 text-xs'>
                      <span>
                        {new Date(incident.occurredAt).toLocaleString()}
                      </span>
                      <Badge
                        variant={incident.safe ? 'secondary' : 'destructive'}
                      >
                        {incident.safe ? 'Safe' : 'Unsafe'}
                      </Badge>
                      <Badge
                        variant={incident.bothFresh ? 'default' : 'outline'}
                      >
                        {incident.bothFresh ? 'Both fresh' : 'Stale feed'}
                      </Badge>
                      {incident.txHash ? (
                        <a
                          href={`https://shannon-explorer.somnia.network/tx/${incident.txHash}`}
                          target='_blank'
                          rel='noreferrer'
                          className='text-primary hover:underline'
                        >
                          View tx
                        </a>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
