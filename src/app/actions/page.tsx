'use client'

import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Loader2,
  Play,
  ShieldCheck
} from 'lucide-react'

import { useMutation, useQuery } from 'convex/react'
import { useAccount, usePublicClient, useSendTransaction } from 'wagmi'

import { ActionsSkeleton } from '@/components/skeletons/page-skeletons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
  const { user, loading: sessionLoading } = useSession()
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { sendTransactionAsync } = useSendTransaction()
  const { toast } = useToast()
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const intents = useQuery(api.actionIntents.listByState, {
    state: undefined,
    limit: 100
  })
  const setState = useMutation(api.actionIntents.setState)

  const initialLoading = sessionLoading || intents === undefined

  if (initialLoading) {
    return <ActionsSkeleton />
  }

  const intentList = intents ?? []

  const handleApprove = async (intentId: string) => {
    setPending(prev => ({ ...prev, [intentId]: true }))
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
      setPending(prev => ({ ...prev, [intentId]: false }))
    }
  }

  const handleExecute = async (intent: any) => {
    if (!address) {
      toast({
        title: 'Wallet required',
        description: 'Connect your wallet to execute guardian transactions.',
        variant: 'destructive'
      })
      return
    }

    const target =
      (intent.plan?.target as string | undefined) ??
      (intent.plan?.arguments?.target as string | undefined)
    const calldata = intent.plan?.calldata as string | undefined

    if (
      !target ||
      !target.startsWith('0x') ||
      target.length !== 42 ||
      !calldata ||
      !calldata.startsWith('0x')
    ) {
      toast({
        title: 'Missing contract data',
        description:
          'This plan is missing executable call data. Review the incident details for manual steps.',
        variant: 'destructive'
      })
      return
    }

    setPending(prev => ({ ...prev, [intent._id]: true }))
    try {
      const hash = await sendTransactionAsync({
        to: target as `0x${string}`,
        data: calldata as `0x${string}`,
        account: address
      })

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        if (receipt.status !== 'success') {
          throw new Error('Guardian transaction reverted')
        }
      }

      await setState({
        intentId: intent._id as any,
        state: 'executed',
        actor: user?.address ?? 'operator',
        txHash: hash
      })
      toast({
        title: 'Action executed',
        description: 'GuardianHub call was broadcast and confirmed on-chain.'
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again'
      toast({
        title: 'Execution failed',
        description: message.includes('User rejected')
          ? 'Transaction was rejected in your wallet.'
          : message,
        variant: 'destructive'
      })
    } finally {
      setPending(prev => ({ ...prev, [intent._id]: false }))
    }
  }

  if (!intentList.length) {
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
              {intentList.length}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground max-w-2xl'>
            Review and approve AI-suggested mitigations before executing them via
            AgentInbox/GuardianHub
          </p>
        </div>
      </header>

      <div className='grid gap-4'>
        {intentList.map(intent => (
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
                    disabled={intent.state !== 'proposed' || pending[intent._id]}
                  >
                    {pending[intent._id] ? (
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

                  <Button
                    size='sm'
                    className={cn(
                      'gap-2',
                      intent.state === 'approved'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : ''
                    )}
                    onClick={() => handleExecute(intent)}
                    disabled={intent.state !== 'approved' || pending[intent._id]}
                  >
                    {pending[intent._id] ? (
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
