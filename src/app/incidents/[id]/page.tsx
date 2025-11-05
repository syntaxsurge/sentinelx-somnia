'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { useMutation, useQuery } from 'convex/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { api } from '@/convex/_generated/api'
import { useToast } from '@/components/ui/use-toast'

const severityVariant: Record<string, 'secondary' | 'default' | 'destructive'> =
  {
    low: 'secondary',
    medium: 'default',
    high: 'default',
    critical: 'destructive'
  }

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const incident = useQuery(
    api.incidents.get,
    params?.id ? { incidentId: params.id as any } : 'skip'
  )
  const monitor = useQuery(
    api.monitors.get,
    incident?._id ? { monitorId: incident.monitorId as any } : 'skip'
  )
  const telemetry = useQuery(
    api.telemetry.recentForMonitor,
    incident?.monitorId
      ? { monitorId: incident.monitorId as any, limit: 40 }
      : 'skip'
  )
  const actionIntents = useQuery(
    api.actionIntents.listForIncident,
    params?.id ? { incidentId: params.id as any } : 'skip'
  )

  const acknowledge = useMutation(api.incidents.acknowledge)
  const closeIncident = useMutation(api.incidents.close)
  const createIntent = useMutation(api.actionIntents.create)

  const [planning, setPlanning] = useState(false)

  if (!incident) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardContent className='py-12 text-center text-sm text-muted-foreground'>
          Loading incident…
        </CardContent>
      </Card>
    )
  }

  const handleGeneratePlan = async () => {
    if (!incident || !monitor) return
    try {
      setPlanning(true)
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: {
            summary: incident.summary,
            severity: incident.severity,
            root_cause: incident.rootCause,
            mitigations: incident.mitigations ?? [],
            monitor: {
              contractAddress: monitor.contractAddress,
              guardianAddress: monitor.guardianAddress,
              routerAddress: monitor.routerAddress,
              name: monitor.name,
              oracleKey: monitor.oracleKey
            }
          }
        })
      })

      const data = await response.json()
      const proposals: Array<{
        name: string
        arguments: { rationale: string }
      }> = data.proposals ?? []

      for (const proposal of proposals) {
        await createIntent({
          incidentId: incident._id,
          proposer: 'sentinelx-operator',
          plan: proposal,
          rationale: proposal.arguments.rationale
        })
      }

      if (proposals.length === 0) {
        toast({
          title: 'No actions required',
          description:
            'The AI co-pilot did not find additional mitigations for this incident.'
        })
      } else {
        toast({
          title: 'Action proposals generated',
          description: `${proposals.length} plan(s) pushed to the queue.`
        })
      }
    } catch (error) {
      toast({
        title: 'Failed to generate plan',
        description: (error as Error).message,
        variant: 'destructive'
      })
    } finally {
      setPlanning(false)
    }
  }

  const handleAcknowledge = async () => {
    if (!incident) return
    await acknowledge({
      incidentId: incident._id as any,
      actor: 'operator'
    })
    toast({ title: 'Incident acknowledged' })
  }

  const handleClose = async () => {
    if (!incident) return
    await closeIncident({
      incidentId: incident._id as any,
      actor: 'operator',
      txHash: undefined
    })
    toast({ title: 'Incident closed' })
    router.push('/incidents')
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-wide text-muted-foreground'>
            SentinelX incident
          </p>
          <h1 className='text-3xl font-semibold tracking-tight'>
            {incident.summary}
          </h1>
          <p className='text-sm text-muted-foreground'>
            Opened {new Date(incident.openedAt).toLocaleString()} · status{' '}
            <span className='uppercase'>{incident.status}</span>
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <Badge variant={severityVariant[incident.severity] ?? 'default'}>
            {incident.severity}
          </Badge>
          <Button variant='secondary' onClick={handleAcknowledge}>
            Acknowledge
          </Button>
          <Button onClick={handleClose}>Close incident</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI summary</CardTitle>
          <CardDescription>
            Generated via SentinelX co-pilot during anomaly detection.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-muted-foreground'>
          <div>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              Root cause
            </p>
            <p>{incident.rootCause}</p>
          </div>
          {incident.mitigations?.length ? (
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                Mitigations
              </p>
              <ul className='list-disc space-y-1 pl-4'>
                {incident.mitigations.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {incident.details ? (
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                Telemetry snapshot
              </p>
              <pre className='mt-2 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs'>
                {JSON.stringify(incident.details, null, 2)}
              </pre>
            </div>
          ) : null}
          <div className='flex flex-wrap gap-2'>
            {incident.advisoryTags?.map(tag => (
              <Badge key={tag} variant='outline'>
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-start justify-between'>
          <div>
            <CardTitle>Action intents</CardTitle>
            <CardDescription>
              Proposed mitigations ready for operator approval.
            </CardDescription>
          </div>
          <Button onClick={handleGeneratePlan} disabled={planning}>
            {planning ? 'Generating…' : 'Generate new plan'}
          </Button>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-muted-foreground'>
          {actionIntents?.length ? (
            actionIntents.map(intent => (
              <div
                key={intent._id}
                className='rounded-md border border-border/60 p-4'
              >
                <div className='flex items-center justify-between'>
                  <span className='font-medium text-foreground'>
                    {intent.plan?.name}
                  </span>
                  <Badge variant='outline'>{intent.state}</Badge>
                </div>
                <p className='mt-1 text-xs leading-relaxed'>
                  {intent.rationale}
                </p>
                {intent.plan?.arguments ? (
                  <pre className='mt-3 overflow-x-auto rounded-md bg-muted/40 p-2 text-xs'>
                    {JSON.stringify(intent.plan.arguments, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          ) : (
            <p>No action intents yet. Generate a plan to queue mitigations.</p>
          )}
        </CardContent>
      </Card>

      {telemetry?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent telemetry</CardTitle>
            <CardDescription>
              Latest SafeOracle observations associated with this monitor.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-xs text-muted-foreground'>
            {telemetry.map(entry => (
              <div
                key={entry._id}
                className='rounded-md border border-border/60 p-3'
              >
                <div className='flex items-center justify-between text-sm text-foreground'>
                  <span>{entry.source}</span>
                  <span>{new Date(entry.ts).toLocaleString()}</span>
                </div>
                <pre className='mt-2 overflow-x-auto rounded bg-muted/40 p-2'>
                  {JSON.stringify(entry.datapoint, null, 2)}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Separator />

      <Button variant='outline' onClick={() => router.push('/incidents')}>
        Back to incidents
      </Button>
    </div>
  )
}
