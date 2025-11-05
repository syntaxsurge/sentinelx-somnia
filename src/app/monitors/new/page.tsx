'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from 'convex/react'
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
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'

const schema = z.object({
  name: z
    .string()
    .min(3, 'Provide a descriptive monitor name')
    .max(80, 'Keep the name concise'),
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
  oracleKey: z.enum(['ETH/USD', 'BTC/USD', 'USDC/USD']),
  protofireFeed: z
    .string()
    .startsWith('0x')
    .length(42, 'Enter a valid address'),
  diaFeed: z.string().startsWith('0x').length(42, 'Enter a valid address'),
  maxDeviationBps: z.coerce.number().min(10).max(2000),
  staleAfterSeconds: z.coerce.number().min(60).max(3600)
})

const defaults = {
  'ETH/USD': {
    protofireFeed: '0xd9132c1d762D432672493F640a63B758891B449e',
    diaFeed: '0x786c7893F8c26b80d42088749562eDb50Ba9601E'
  },
  'BTC/USD': {
    protofireFeed: '0x8CeE6c58b8CbD8afdEaF14e6fCA0876765e161fE',
    diaFeed: '0x4803db1ca3A1DA49c3DB991e1c390321c20e1f21'
  },
  'USDC/USD': {
    protofireFeed: '0xa2515C9480e62B510065917136B08F3f7ad743B4',
    diaFeed: '0x235266D5ca6f19F134421C49834C108b32C2124e'
  }
} as const

export default function NewMonitorPage() {
  const { user } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )
  const createMonitor = useMutation(api.monitors.create)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      contractAddress: '',
      guardianAddress: '',
      routerAddress: '',
      oracleKey: 'ETH/USD',
      protofireFeed: defaults['ETH/USD'].protofireFeed,
      diaFeed: defaults['ETH/USD'].diaFeed,
      maxDeviationBps: 100,
      staleAfterSeconds: 180
    }
  })

  const currentOracle = form.watch('oracleKey')

  const preset = defaults[currentOracle]

  useEffect(() => {
    form.setValue('protofireFeed', preset.protofireFeed, { shouldDirty: true })
    form.setValue('diaFeed', preset.diaFeed, { shouldDirty: true })
  }, [form, preset.diaFeed, preset.protofireFeed])

  if (!user?.address) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Connect & sign first.
      </p>
    )
  }

  if (!tenant) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Workspace not found.
      </p>
    )
  }

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    await createMonitor({
      tenantId: tenant._id,
      name: values.name,
      type: 'price',
      params: {
        oracleKey: values.oracleKey,
        maxDeviationBps: values.maxDeviationBps,
        staleAfterSeconds: values.staleAfterSeconds
      },
      contractAddress: values.contractAddress,
      guardianAddress: values.guardianAddress,
      routerAddress: values.routerAddress,
      oracleKey: values.oracleKey,
      protofireFeed: values.protofireFeed,
      diaFeed: values.diaFeed,
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
          Bind a guardable contract, oracle feeds, and guardian hub. Defaults
          include Somnia Testnet addresses.
        </p>
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

          <FormField
            control={form.control}
            name='guardianAddress'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian hub</FormLabel>
                <FormControl>
                  <Input placeholder='0x...' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='routerAddress'
            render={({ field }) => (
              <FormItem>
                <FormLabel>SafeOracleRouter</FormLabel>
                <FormControl>
                  <Input placeholder='0x...' {...field} />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select pair' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='ETH/USD'>ETH/USD</SelectItem>
                    <SelectItem value='BTC/USD'>BTC/USD</SelectItem>
                    <SelectItem value='USDC/USD'>USDC/USD</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='protofireFeed'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protofire aggregator</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
            Register monitor
          </Button>
        </form>
      </Form>
    </div>
  )
}
