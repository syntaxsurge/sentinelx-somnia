'use client'

import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Loader2,
  Play,
  ShieldCheck
} from 'lucide-react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

function ActionStateBadge({ state }: { state: string }) {
  const config = {
    proposed: { variant: 'secondary' as const, icon: Clock, label: 'Proposed' },
    approved: { variant: 'default' as const, icon: Check, label: 'Approved' },
    executed: { variant: 'outline' as const, icon: CheckCircle2, label: 'Executed' }
  }

  const stateConfig = config[state as keyof typeof config] ?? config.proposed
  const Icon = stateConfig.icon

  return (
    <Badge variant={stateConfig.variant} className='flex items-center gap-1 w-fit'>
      <Icon className='h-3 w-3' />
      {stateConfig.label}
    </Badge>
  )
}

export default function ActionsPage() {
  const { user } = useSession()
  const { toast } = useToast()
  const [txMap, setTxMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const intents = useQuery(api.actionIntents.listByState, {
    state: undefined,
    limit: 100
  })
  const setState = useMutation(api.actionIntents.setState)

  const handleApprove = async (intentId: string) => {
    setLoading(prev => ({ ...prev, [intentId]: true }))
    try {
      await setState({
        intentId: intentId as any,
        state: 'approved',
        actor: user?.address ?? 'operator'
      })
      toast({
        title: 'Action approved',
        description: 'The action intent has been approved and is ready for execution'
      })
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setLoading(prev => ({ ...prev, [intentId]: false }))
    }
  }

  const handleExecute = async (intentId: string) => {
    const txHash = txMap[intentId]
    if (!txHash) {
      toast({
        title: 'Transaction hash required',
        description:
          'Provide the on-chain transaction hash once the GuardianHub execution succeeds.',
        variant: 'destructive'
      })
      return
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      toast({
        title: 'Invalid hash format',
        description: 'Transaction hashes must be 66 hex characters starting with 0x.',
        variant: 'destructive'
      })
      return
    }

    setLoading(prev => ({ ...prev, [intentId]: true }))
    try {
      await setState({
        intentId: intentId as any,
        state: 'executed',
        actor: user?.address ?? 'operator',
        txHash
      })
      toast({
        title: 'Action marked as executed',
        description: 'The action has been successfully executed on-chain'
      })
    } catch (error) {
      toast({
        title: 'Execution failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setLoading(prev => ({ ...prev, [intentId]: false }))
    }
  }

  if (!intents?.length) {
    return (
      <div className='space-y-6'>
        <header className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight text-foreground'>
            Action Queue
          </h1>
          <p className='text-sm text-muted-foreground max-w-2xl'>
            Review and approve AI-suggested mitigations before executing them via
            AgentInbox/GuardianHub
          </p>
        </header>
        <Card className='border-border/60'>
          <CardContent className='flex flex-col items-center py-16'>
            <ShieldCheck className='h-12 w-12 text-primary/50 mb-4' />
            <p className='text-sm font-medium text-foreground'>No pending actions</p>
            <p className='text-xs text-muted-foreground text-center mt-1 max-w-md'>
              Action intents will appear here when critical or high severity incidents are detected
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground'>
              Action Queue
            </h1>
            <Badge variant='secondary' className='text-sm'>
              {intents.length}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground max-w-2xl'>
            Review and approve AI-suggested mitigations before executing them via
            AgentInbox/GuardianHub
          </p>
        </div>
      </header>

      <div className='grid gap-4'>
        {intents.map(intent => (
          <Card key={intent._id} className='border-border/60 hover:border-primary/50 transition-all'>
            <CardHeader className='space-y-3'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20'>
                      <ShieldCheck className='h-4 w-4 text-primary' />
                    </div>
                    <CardTitle className='text-lg text-foreground'>
                      {intent.plan?.name ?? 'SentinelX Action Plan'}
                    </CardTitle>
                  </div>
                  <CardDescription className='text-xs flex items-center gap-2'>
                    <Clock className='h-3 w-3' />
                    Proposed {new Date(intent.proposedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} by <span className='font-medium'>{intent.proposer}</span>
                  </CardDescription>
                </div>
                <ActionStateBadge state={intent.state} />
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg bg-muted/30 border border-border/60 p-4'>
                <p className='text-sm text-foreground leading-relaxed'>
                  {intent.rationale}
                </p>
              </div>

              {intent.plan?.calldata ? (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Code2 className='h-4 w-4 text-muted-foreground' />
                    <Label className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      Contract Call Data
                    </Label>
                  </div>
                  <pre className='overflow-x-auto rounded-lg bg-muted/50 border border-border/60 p-4 text-xs font-mono'>
                    {JSON.stringify(
                      {
                        target:
                          (intent.plan as any).target ??
                          intent.plan?.arguments?.target,
                        calldata: intent.plan.calldata
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              ) : null}

              <div className='flex flex-col gap-3 pt-2'>
                <div className='flex flex-wrap items-end gap-3'>
                  <Button
                    size='sm'
                    variant='secondary'
                    className='gap-2'
                    onClick={() => handleApprove(intent._id as string)}
                    disabled={intent.state !== 'proposed' || loading[intent._id]}
                  >
                    {loading[intent._id] ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Check className='h-4 w-4' />
                        Approve
                      </>
                    )}
                  </Button>

                  <div className='flex-1 min-w-[280px] space-y-2'>
                    <Label htmlFor={`tx-${intent._id}`} className='text-xs'>
                      Transaction Hash
                    </Label>
                    <div className='flex items-center gap-2'>
                      <Input
                        id={`tx-${intent._id}`}
                        placeholder='0x...'
                        className='flex-1 font-mono text-xs'
                        value={txMap[intent._id] ?? ''}
                        onChange={event =>
                          setTxMap(prev => ({
                            ...prev,
                            [intent._id]: event.target.value
                          }))
                        }
                        disabled={intent.state === 'executed'}
                      />
                      <Button
                        size='sm'
                        className='gap-2'
                        onClick={() => handleExecute(intent._id as string)}
                        disabled={intent.state !== 'approved' || loading[intent._id]}
                      >
                        {loading[intent._id] ? (
                          <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className='h-4 w-4' />
                            Execute
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
