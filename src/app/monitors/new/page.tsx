'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from 'convex/react'
import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'
import type { ChainConfig } from '@/lib/config'

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className='space-y-1'>
      <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
      <Input
        value={value}
        readOnly
        className='font-mono text-xs bg-muted/40 text-foreground'
      />
    </div>
  )
}

const fetcher = async (url: string): Promise<ChainConfig> => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Unable to load chain configuration')
  }
  return response.json()
}

const schema = z.object({
  name: z
    .string()
    .min(3, 'Provide a descriptive monitor name')
    .max(80, 'Keep the name concise'),
  oracleKey: z.enum(['ETH/USD', 'BTC/USD', 'USDC/USD']),
  contractAddress: z
    .string()
    .startsWith('0x', 'Enter a valid address')
    .length(42, 'Enter a valid address'),
  maxDeviationBps: z.coerce.number().min(10).max(2000),
  staleAfterSeconds: z.coerce.number().min(60).max(3600)
})

export default function NewMonitorPage() {
  const { user } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const { data: config, error } = useSWR('/api/config/chain', fetcher)

  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )

  const createMonitor = useMutation(api.monitors.create)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      oracleKey: 'ETH/USD',
      contractAddress: '',
      maxDeviationBps: 100,
      staleAfterSeconds: 180
    }
  })

  useEffect(() => {
    if (!config) return
    form.setValue('maxDeviationBps', config.defaults.maxDeviationBps, {
      shouldDirty: false
    })
    form.setValue('staleAfterSeconds', config.defaults.staleAfterSeconds, {
      shouldDirty: false
    })
  }, [config, form])

  const currentOracle = form.watch('oracleKey')
  const currentFeed = config?.feeds?.[currentOracle]

  if (!user?.address) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Connect &amp; sign first.
      </p>
    )
  }

  if (error) {
    return (
      <p className='py-10 text-center text-sm text-rose-500'>
        Unable to load chain configuration. Check deployment assets.
      </p>
    )
  }

  if (!tenant || !config) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Loading deployment configuration...
      </p>
    )
  }

  const handleSeedDemo = () => {
    form.setValue('name', 'Somnia ETH/USD router guard', { shouldDirty: true })
    form.setValue('oracleKey', 'ETH/USD', { shouldDirty: true })
    form.setValue('contractAddress', config.demoPausable, { shouldDirty: true })
    form.setValue('maxDeviationBps', config.defaults.maxDeviationBps, {
      shouldDirty: true
    })
    form.setValue('staleAfterSeconds', config.defaults.staleAfterSeconds, {
      shouldDirty: true
    })
  }

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    const feed = config.feeds[values.oracleKey]
    if (!feed) {
      toast({
        title: 'Unsupported oracle pair',
        description: 'Update config/chain.somniatest.json with feed addresses.',
        variant: 'destructive'
      })
      return
    }

    await createMonitor({
      tenantId: tenant._id,
      name: values.name,
      type: 'price',
      params: {
        oracleKey: values.oracleKey,
        maxDeviationBps: values.maxDeviationBps,
        staleAfterSeconds: values.staleAfterSeconds,
        agentInbox: config.agentInbox,
        demoOracle: config.demoOracle,
        demoPausable: config.demoPausable
      },
      contractAddress: values.contractAddress,
      guardianAddress: config.guardianHub,
      routerAddress: config.oracleRouter,
      oracleKey: values.oracleKey,
      protofireFeed: feed.protofire,
      diaFeed: feed.dia,
      maxDeviationBps: values.maxDeviationBps,
      staleAfterSeconds: values.staleAfterSeconds
    })

    toast({
      title: 'Monitor created',
      description: `${values.oracleKey} watcher active.`
    })
    router.push('/dashboard')
  }

  return (
    <div className='mx-auto max-w-3xl space-y-6 py-10'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-semibold'>Register a monitor</h1>
          <p className='text-sm text-muted-foreground'>
            Wire your contract into SentinelX guardrails. Platform infrastructure
            is fixed from deployment config; editable fields cover your policy and
            guarded contract.
          </p>
        </div>
        <Button variant='outline' onClick={handleSeedDemo}>
          Seed demo values
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Monitor configuration</CardTitle>
              <CardDescription>
                Choose the oracle pair, set thresholds, and point to your guarded contract.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monitor name</FormLabel>
                    <FormControl>
                      <Input placeholder='Somnia ETH/USD router guard' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='oracleKey'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oracle pair</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select pair' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(config.feeds).map(pair => (
                          <SelectItem key={pair} value={pair}>
                            {pair}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contractAddress'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guarded contract</FormLabel>
                    <FormControl>
                      <Input placeholder='0x...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='maxDeviationBps'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max deviation (bps)</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='staleAfterSeconds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stale after (seconds)</FormLabel>
                      <FormControl>
                        <Input type='number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type='submit' className='w-full'>
                Create monitor
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>

      <Card>
        <CardHeader>
          <CardTitle>SentinelX infrastructure</CardTitle>
          <CardDescription>
            These addresses are fixed per deployment and used for execution and data plane reads.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-muted-foreground'>
          <ReadonlyField label='Guardian Hub' value={config.guardianHub} />
          <ReadonlyField label='AgentInbox' value={config.agentInbox} />
          <ReadonlyField label='SafeOracleRouter' value={config.oracleRouter} />
          <div className='grid gap-4 md:grid-cols-2'>
            <ReadonlyField
              label={`Protofire (${currentOracle})`}
              value={currentFeed?.protofire ?? '—'}
            />
            <ReadonlyField
              label={`DIA (${currentOracle})`}
              value={currentFeed?.dia ?? '—'}
            />
          </div>
          <ReadonlyField label='Demo oracle' value={config.demoOracle} />
          <ReadonlyField label='Demo pausable contract' value={config.demoPausable} />
        </CardContent>
      </Card>
    </div>
  )
}
