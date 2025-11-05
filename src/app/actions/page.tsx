'use client'

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
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'
import { useToast } from '@/components/ui/use-toast'

function ActionStateBadge({ state }: { state: string }) {
  const variant =
    state === 'proposed'
      ? 'secondary'
      : state === 'approved'
        ? 'default'
        : state === 'executed'
          ? 'outline'
          : 'secondary'

  return (
    <Badge variant={variant as 'secondary' | 'default' | 'outline'}>
      {state}
    </Badge>
  )
}

export default function ActionsPage() {
  const { user } = useSession()
  const { toast } = useToast()
  const [txMap, setTxMap] = useState<Record<string, string>>({})
  const intents = useQuery(api.actionIntents.listByState, {
    state: undefined,
    limit: 100
  })
  const setState = useMutation(api.actionIntents.setState)

  const handleApprove = async (intentId: string) => {
    await setState({
      intentId: intentId as any,
      state: 'approved',
      actor: user?.address ?? 'operator'
    })
    toast({ title: 'Action approved' })
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

    await setState({
      intentId: intentId as any,
      state: 'executed',
      actor: user?.address ?? 'operator',
      txHash
    })
    toast({ title: 'Action marked as executed' })
  }

  if (!intents?.length) {
    return (
      <Card>
        <CardContent className='py-12 text-center text-sm text-muted-foreground'>
          No action intents are queued yet. Incidents with severity high or
          critical will surface plans here.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>
          Action queue
        </h1>
        <p className='text-sm text-muted-foreground'>
          Review AI-suggested mitigations before executing them via
          AgentInbox/GuardianHub.
        </p>
      </header>

      <div className='grid gap-4'>
        {intents.map(intent => (
          <Card key={intent._id}>
            <CardHeader className='flex flex-row items-start justify-between gap-4'>
              <div>
                <CardTitle className='text-base text-foreground'>
                  {intent.plan?.name ?? 'SentinelX plan'}
                </CardTitle>
                <CardDescription className='text-xs'>
                  Proposed {new Date(intent.proposedAt).toLocaleString()} by{' '}
                  {intent.proposer}
                </CardDescription>
              </div>
              <ActionStateBadge state={intent.state} />
            </CardHeader>
            <CardContent className='space-y-4 text-sm text-muted-foreground'>
              <p>{intent.rationale}</p>

              {intent.plan?.calldata ? (
                <div>
                  <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                    Call data
                  </p>
                  <pre className='mt-2 overflow-x-auto rounded bg-muted/40 p-3 text-xs'>
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

              <div className='flex flex-wrap items-center gap-3'>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => handleApprove(intent._id as string)}
                  disabled={intent.state !== 'proposed'}
                >
                  Approve
                </Button>
                <div className='flex items-center gap-2'>
                  <Input
                    placeholder='0x transaction hash'
                    className='w-56'
                    value={txMap[intent._id] ?? ''}
                    onChange={event =>
                      setTxMap(prev => ({
                        ...prev,
                        [intent._id]: event.target.value
                      }))
                    }
                  />
                  <Button
                    size='sm'
                    onClick={() => handleExecute(intent._id as string)}
                    disabled={intent.state !== 'approved'}
                  >
                    Mark executed
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
