'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from 'convex/react'
import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/lib/utils'
import type { ChainConfig } from '@/lib/config'

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
    .startsWith('0x')
    .length(42, 'Enter a valid address'),
  guardianAddress: z
    .string()
    .startsWith('0x')
    .length(42, 'Enter a valid address'),
  routerAddress: z
    .string()
    .startsWith('0x')
    .length(42, 'Enter a valid address'),
  agentInbox: z
    .string()
    .startsWith('0x')
    .length(42, 'Enter a valid address'),
  protofireFeed: z
    .string()
    .startsWith('0x')
    .length(42, 'Enter a valid address'),
  diaFeed: z.string().startsWith('0x').length(42, 'Enter a valid address'),
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
  const profile = useQuery(
    api.users.me,
    user?.address ? { address: user.address } : 'skip'
  )

  const createMonitor = useMutation(api.monitors.create)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      oracleKey: 'ETH/USD',
      contractAddress: '0x0000000000000000000000000000000000000000',
      guardianAddress: '0x0000000000000000000000000000000000000000',
      routerAddress: '0x0000000000000000000000000000000000000000',
      agentInbox: '0x0000000000000000000000000000000000000000',
      protofireFeed: '0x0000000000000000000000000000000000000000',
      diaFeed: '0x0000000000000000000000000000000000000000',
      maxDeviationBps: 100,
      staleAfterSeconds: 180
    }
  })

  const feeds = useMemo(() => config?.feeds ?? {}, [config])
  const allowOverrideEnv =
    process.env.NEXT_PUBLIC_ALLOW_CONTRACT_OVERRIDE === 'true'
  const hasAdminRole = Boolean(
    profile?.roles?.includes('admin') || profile?.roles?.includes('owner')
  )
  const allowOverride = allowOverrideEnv && hasAdminRole

  const [advanced, setAdvanced] = useState(false)
  const overrideEnabled = advanced && allowOverride

  const initialisedRef = useRef(false)

  useEffect(() => {
    if (!config || initialisedRef.current) return
    const defaultFeed = config.feeds['ETH/USD'] ?? Object.values(config.feeds)[0]
    form.reset({
      name: '',
      oracleKey: 'ETH/USD',
      contractAddress: config.demoPausable,
      guardianAddress: config.guardianHub,
      routerAddress: config.oracleRouter,
      agentInbox: config.agentInbox,
      protofireFeed: defaultFeed?.protofire ?? form.getValues('protofireFeed'),
      diaFeed: defaultFeed?.dia ?? form.getValues('diaFeed'),
      maxDeviationBps: config.defaults.maxDeviationBps,
      staleAfterSeconds: config.defaults.staleAfterSeconds
    })
    initialisedRef.current = true
  }, [config, form])

  const currentOracle = form.watch('oracleKey')

  useEffect(() => {
    if (!config) return
    const feed = feeds[currentOracle]
    if (!feed) return
    if (!overrideEnabled) {
      form.setValue('protofireFeed', feed.protofire, { shouldDirty: false })
      form.setValue('diaFeed', feed.dia, { shouldDirty: false })
    }
  }, [config, feeds, form, currentOracle, overrideEnabled])

  useEffect(() => {
    if (!config || overrideEnabled) return
    form.setValue('contractAddress', config.demoPausable, { shouldDirty: false })
    form.setValue('guardianAddress', config.guardianHub, { shouldDirty: false })
    form.setValue('routerAddress', config.oracleRouter, { shouldDirty: false })
    form.setValue('agentInbox', config.agentInbox, { shouldDirty: false })
  }, [config, form, overrideEnabled])

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

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    const feed = feeds[values.oracleKey]
    const resolved = overrideEnabled
      ? values
      : {
          ...values,
          contractAddress: config.demoPausable,
          guardianAddress: config.guardianHub,
          routerAddress: config.oracleRouter,
          agentInbox: config.agentInbox,
          protofireFeed: feed?.protofire ?? values.protofireFeed,
          diaFeed: feed?.dia ?? values.diaFeed
        }

    await createMonitor({
      tenantId: tenant._id,
      name: values.name,
      type: 'price',
      params: {
        oracleKey: values.oracleKey,
        maxDeviationBps: values.maxDeviationBps,
        staleAfterSeconds: values.staleAfterSeconds,
        agentInbox: resolved.agentInbox,
        demoOracle: config.demoOracle,
        demoPausable: config.demoPausable
      },
      contractAddress: resolved.contractAddress,
      guardianAddress: resolved.guardianAddress,
      routerAddress: resolved.routerAddress,
      oracleKey: values.oracleKey,
      protofireFeed: resolved.protofireFeed,
      diaFeed: resolved.diaFeed,
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
    <div className='mx-auto max-w-2xl space-y-6 py-10'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold'>Register a monitor</h1>
        <p className='text-sm text-muted-foreground'>
          Core infrastructure addresses are locked from deployment config for a
          reliable demo. Enable overrides only if you are configuring a partner
          integration.
        </p>
      </div>

      <div className='flex items-center justify-end gap-3 rounded-md border border-border/50 bg-muted/30 p-4 text-sm'>
        <div>
          <p className='font-medium text-foreground'>Advanced override</p>
          <p className='text-xs text-muted-foreground'>
            Requires admin role and <code>NEXT_PUBLIC_ALLOW_CONTRACT_OVERRIDE</code>.
          </p>
        </div>
        <Switch
          id='advanced'
          checked={overrideEnabled}
          onCheckedChange={setAdvanced}
          disabled={!allowOverride}
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='space-y-6 rounded-xl border border-border bg-card p-6'
        >
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
                    {Object.keys(feeds).map(pair => (
                      <SelectItem value={pair} key={pair}>
                        {pair}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='contractAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guarded contract</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!overrideEnabled}
                      className={cn(
                        !overrideEnabled && 'cursor-not-allowed bg-muted/60'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='guardianAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian hub</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!overrideEnabled}
                      className={cn(
                        !overrideEnabled && 'cursor-not-allowed bg-muted/60'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='routerAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SafeOracleRouter</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!overrideEnabled}
                      className={cn(
                        !overrideEnabled && 'cursor-not-allowed bg-muted/60'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='agentInbox'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AgentInbox</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!overrideEnabled}
                      className={cn(
                        !overrideEnabled && 'cursor-not-allowed bg-muted/60'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='protofireFeed'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protofire aggregator</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!overrideEnabled}
                      className={cn(
                        !overrideEnabled && 'cursor-not-allowed bg-muted/60'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='diaFeed'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DIA adapter</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!overrideEnabled}
                      className={cn(
                        !overrideEnabled && 'cursor-not-allowed bg-muted/60'
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                  <FormLabel>Stale after (s)</FormLabel>
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
        </form>
      </Form>
    </div>
  )
}
