'use client'

import { useCallback, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from 'convex/react'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import { z } from 'zod'

import { SettingsSkeleton } from '@/components/skeletons/page-skeletons'
import { api } from '@/convex/_generated/api'
import { useSession } from '@/hooks/useSession'
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
  FormDescription,
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

type ApiKeyRecord = {
  _id: string
  label: string
  hash: string
  createdAt: number
  lastUsedAt?: number
  revokedAt?: number
}

type WebhookRecord = {
  _id: string
  label: string
  kind: 'slack' | 'discord' | 'http'
  destination: string
  secret?: string
  createdAt: number
}

type GuardianRecord = {
  _id: string
  address: string
  role?: string
  createdAt: number
}

const apiKeySchema = z.object({
  label: z
    .string()
    .min(3, 'Label must be at least 3 characters')
    .max(64)
})

const webhookSchema = z.object({
  label: z
    .string()
    .min(3, 'Label must be at least 3 characters')
    .max(64),
  kind: z.enum(['slack', 'discord', 'http']),
  destination: z
    .string()
    .url('Destination must be a valid URL')
    .max(256),
  secret: z
    .union([z.string().max(128), z.literal('')])
    .optional()
})

const guardianSchema = z.object({
  address: z
    .string()
    .startsWith('0x', 'Address must start with 0x')
    .length(42, 'Address must be 42 characters'),
  role: z.union([z.string().max(64), z.literal('')]).optional()
})

type ApiKeyFormValues = z.infer<typeof apiKeySchema>
type WebhookFormValues = z.infer<typeof webhookSchema>
type GuardianFormValues = z.infer<typeof guardianSchema>

const webhookKinds = [
  { value: 'slack', label: 'Slack' },
  { value: 'discord', label: 'Discord' },
  { value: 'http', label: 'HTTP' }
] as const

export default function SettingsPage() {
  const { user, loading } = useSession()
  const tenant = useQuery(
    api.tenants.getByOwner,
    user?.address ? { owner: user.address } : 'skip'
  )

  const tenantId = tenant?._id

  const {
    data: apiKeys,
    isLoading: apiKeysLoading,
    mutate: mutateApiKeys
  } = useSWR(
    tenantId ? `/api/api-keys?tenantId=${tenantId}` : null,
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load API keys')
      const payload = await response.json()
      return payload.keys as Array<ApiKeyRecord>
    }
  )

  const {
    data: webhooks,
    isLoading: webhooksLoading,
    mutate: mutateWebhooks
  } = useSWR(
    tenantId ? `/api/webhooks?tenantId=${tenantId}` : null,
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load webhooks')
      const payload = await response.json()
      return payload.webhooks as Array<WebhookRecord>
    }
  )

  const {
    data: guardians,
    isLoading: guardianLoading,
    mutate: mutateGuardians
  } = useSWR(
    tenantId ? `/api/guardian-operators?tenantId=${tenantId}` : null,
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load guardian operators')
      const payload = await response.json()
      return payload.guardians as Array<GuardianRecord>
    }
  )

  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const { toast } = useToast()

  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { label: '' }
  })

  const webhookForm = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      label: '',
      kind: 'slack',
      destination: '',
      secret: ''
    }
  })

  const guardianForm = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      address: '',
      role: ''
    }
  })

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API unavailable in this environment')
      }
      await navigator.clipboard.writeText(value)
      toast({ title: 'Copied to clipboard' })
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: (error as Error).message,
        variant: 'destructive'
      })
    }
  }, [toast])

  const handleGenerateKey = apiKeyForm.handleSubmit(async values => {
    if (!tenantId) return
    setGeneratedKey(null)

    const response = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, label: values.label })
    })

    if (!response.ok) {
      toast({
        title: 'Failed to generate key',
        description: await response.text(),
        variant: 'destructive'
      })
      return
    }

    const payload = await response.json()
    setGeneratedKey(payload.apiKey)
    apiKeyForm.reset()
    await mutateApiKeys()
    toast({ title: 'API key created', description: values.label })
  })

  const handleRevokeKey = async (apiKeyId: string) => {
    const response = await fetch(`/api/api-keys?apiKeyId=${apiKeyId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      toast({
        title: 'Failed to revoke key',
        variant: 'destructive'
      })
      return
    }

    await mutateApiKeys()
    toast({ title: 'API key revoked' })
  }

  const handleCreateWebhook = webhookForm.handleSubmit(async values => {
    if (!tenantId) return
    const response = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, ...values })
    })

    if (!response.ok) {
      const detail = await response.text()
      toast({
        title: 'Failed to add webhook',
        description: detail,
        variant: 'destructive'
      })
      return
    }

    webhookForm.reset({ label: '', destination: '', secret: '', kind: values.kind })
    await mutateWebhooks()
    toast({ title: 'Webhook added', description: values.label })
  })

  const handleRemoveWebhook = async (webhookId: string) => {
    const response = await fetch(`/api/webhooks?webhookId=${webhookId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      toast({
        title: 'Failed to remove webhook',
        variant: 'destructive'
      })
      return
    }

    await mutateWebhooks()
    toast({ title: 'Webhook removed' })
  }

  const handleAddGuardian = guardianForm.handleSubmit(async values => {
    if (!tenantId) return
    const response = await fetch('/api/guardian-operators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, ...values })
    })

    if (!response.ok) {
      toast({ title: 'Failed to add guardian', variant: 'destructive' })
      return
    }

    guardianForm.reset({ address: '', role: '' })
    await mutateGuardians()
    toast({ title: 'Guardian added', description: values.address })
  })

  const handleRemoveGuardian = async (guardianId: string) => {
    const response = await fetch(
      `/api/guardian-operators?guardianId=${guardianId}`,
      { method: 'DELETE' }
    )

    if (!response.ok) {
      toast({ title: 'Failed to remove guardian', variant: 'destructive' })
      return
    }

    await mutateGuardians()
    toast({ title: 'Guardian removed' })
  }

  const tenantRequested = Boolean(user?.address)
  const tenantLoading = tenantRequested && tenant === undefined
  const resourcesLoading =
    Boolean(tenantId) &&
    (apiKeys === undefined || webhooks === undefined || guardians === undefined)
  const busy = loading || tenantLoading || resourcesLoading

  if (busy) {
    return <SettingsSkeleton />
  }

  if (!user?.address || !tenantId) {
    return (
      <Card className='mx-auto max-w-md'>
        <CardHeader>
          <CardTitle>Connect wallet</CardTitle>
        </CardHeader>
        <CardContent className='text-sm text-muted-foreground'>
          Authenticate with RainbowKit to access tenant automation settings.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-8'>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Settings</h1>
        <p className='text-sm text-muted-foreground'>
          Manage automation credentials, webhook destinations, and guardian
          operators for <span className='font-mono'>{tenant.name}</span>.
        </p>
      </header>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Automation API keys</CardTitle>
            <CardDescription>
              Generate scoped credentials for CI jobs, cron policy runners, and
              third-party automations. Keys are hashed in Convex; copy the
              plaintext once.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Form {...apiKeyForm}>
              <form onSubmit={handleGenerateKey} className='space-y-4'>
                <FormField
                  control={apiKeyForm.control}
                  name='label'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder='policy-runner-prod' {...field} />
                      </FormControl>
                      <FormDescription>
                        Appears in audit logs and the dashboard.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full'>
                  Generate API key
                </Button>
              </form>
            </Form>

            {generatedKey ? (
              <div className='rounded-md border border-dashed border-primary/40 bg-primary/5 p-4 text-sm'>
                <p className='font-medium text-primary'>New API key</p>
                <p className='mt-1 break-all font-mono text-xs'>{generatedKey}</p>
                <div className='mt-3 flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => copyToClipboard(generatedKey)}
                  >
                    Copy key
                  </Button>
                  <p className='text-xs text-muted-foreground'>Store securely; it will not be shown again.</p>
                </div>
              </div>
            ) : null}

            <div className='space-y-3'>
              <h3 className='text-sm font-medium text-muted-foreground'>Existing keys</h3>
              {apiKeysLoading ? (
                <p className='text-sm text-muted-foreground'>Loading keys…</p>
              ) : apiKeys && apiKeys.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-border text-sm'>
                    <thead className='bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                      <tr>
                        <th className='px-3 py-2 font-medium'>Label</th>
                        <th className='px-3 py-2 font-medium'>Created</th>
                        <th className='px-3 py-2 font-medium'>Last used</th>
                        <th className='px-3 py-2 font-medium'>Hash</th>
                        <th className='px-3 py-2 font-medium text-right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                      {apiKeys.map(key => (
                        <tr key={key._id} className='text-sm'>
                          <td className='px-3 py-2'>{key.label}</td>
                          <td className='px-3 py-2 text-muted-foreground'>
                            {new Date(key.createdAt).toLocaleString()}
                          </td>
                          <td className='px-3 py-2 text-muted-foreground'>
                            {key.lastUsedAt
                              ? new Date(key.lastUsedAt).toLocaleString()
                              : 'Never'}
                          </td>
                          <td className='px-3 py-2 font-mono text-xs text-muted-foreground'>
                            {key.hash.slice(0, 16)}…
                          </td>
                          <td className='px-3 py-2 text-right'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => handleRevokeKey(key._id)}
                            >
                              Revoke
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No keys issued yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident webhooks</CardTitle>
            <CardDescription>
              Dispatch incident payloads to Slack, Discord, or HTTP endpoints.
              Configure secrets for signature verification when needed.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Form {...webhookForm}>
              <form onSubmit={handleCreateWebhook} className='space-y-4'>
                <FormField
                  control={webhookForm.control}
                  name='label'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder='Slack – guardian-alerts' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={webhookForm.control}
                    name='kind'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select kind' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {webhookKinds.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={webhookForm.control}
                    name='secret'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder='Used for HMAC verification' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={webhookForm.control}
                  name='destination'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination URL</FormLabel>
                      <FormControl>
                        <Input placeholder='https://hooks.slack.com/services/…' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full'>
                  Add webhook
                </Button>
              </form>
            </Form>

            <div className='space-y-3'>
              <h3 className='text-sm font-medium text-muted-foreground'>Configured webhooks</h3>
              {webhooksLoading ? (
                <p className='text-sm text-muted-foreground'>Loading webhooks…</p>
              ) : webhooks && webhooks.length > 0 ? (
                <div className='space-y-3'>
                  {webhooks.map(webhook => (
                    <div
                      key={webhook._id}
                      className='flex flex-col gap-2 rounded-md border border-border p-4 text-sm'
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <div>
                          <p className='font-medium'>{webhook.label}</p>
                          <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                            {webhook.kind}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveWebhook(webhook._id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className='break-all font-mono text-xs text-muted-foreground'>
                        {webhook.destination}
                      </p>
                      {webhook.secret ? (
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span>Secret:</span>
                          <span className='font-mono'>{webhook.secret}</span>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => copyToClipboard(webhook.secret!)}
                          >
                            Copy
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No webhooks configured yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guardian operators</CardTitle>
          <CardDescription>
            Track the wallets responsible for pause/unpause authority. Keep at
            least two operators available to ensure coverage.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <Form {...guardianForm}>
            <form onSubmit={handleAddGuardian} className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={guardianForm.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian address</FormLabel>
                      <FormControl>
                        <Input placeholder='0x...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={guardianForm.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role / notes</FormLabel>
                      <FormControl>
                        <Input placeholder='Tier 1 operator' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit'>Add guardian</Button>
            </form>
          </Form>

          <div className='space-y-3'>
            <h3 className='text-sm font-medium text-muted-foreground'>Guardian roster</h3>
            {guardianLoading ? (
              <p className='text-sm text-muted-foreground'>Loading guardians…</p>
            ) : guardians && guardians.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-border text-sm'>
                  <thead className='bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                    <tr>
                      <th className='px-3 py-2 font-medium'>Address</th>
                      <th className='px-3 py-2 font-medium'>Role</th>
                      <th className='px-3 py-2 font-medium'>Added</th>
                      <th className='px-3 py-2 text-right font-medium'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {guardians.map(guardian => (
                      <tr key={guardian._id}>
                        <td className='px-3 py-2 font-mono text-xs text-muted-foreground'>
                          {guardian.address}
                        </td>
                        <td className='px-3 py-2'>{guardian.role ?? '—'}</td>
                        <td className='px-3 py-2 text-muted-foreground'>
                          {new Date(guardian.createdAt).toLocaleString()}
                        </td>
                        <td className='px-3 py-2 text-right'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveGuardian(guardian._id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>No guardian operators registered.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
