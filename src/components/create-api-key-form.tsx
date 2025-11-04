'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Tenant = {
  _id: string
  name: string
  owner: string
}

type Props = {
  tenants: Tenant[]
}

export function CreateApiKeyForm({ tenants }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [tenantId, setTenantId] = useState(tenants[0]?._id ?? '')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [latestKey, setLatestKey] = useState<string | null>(null)

  const hasTenants = tenants.length > 0

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLatestKey(null)

    if (!tenantId) {
      setError('Select a tenant before creating an API key.')
      return
    }

    if (!label.trim()) {
      setError('Add a label so you can identify this key later.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId, label })
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(
            payload?.error ?? `Request failed with status ${response.status}`
          )
        }

        const payload = await response.json()
        setLatestKey(payload.apiKey)
        setLabel('')
        router.refresh()
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  const handleCopy = () => {
    if (!latestKey) return
    navigator.clipboard
      ?.writeText(latestKey)
      .catch(() => setError('Unable to copy to clipboard.'))
  }

  if (!hasTenants) {
    return (
      <p className='text-xs text-muted-foreground'>
        Add a tenant first to scope API keys to guardian operators.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='grid gap-4 rounded-2xl border border-border bg-card/70 p-5 text-sm text-foreground shadow-inner'
    >
      <div className='grid gap-2'>
        <label
          className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'
          htmlFor='api-key-tenant'
        >
          Tenant
        </label>
        <select
          id='api-key-tenant'
          value={tenantId}
          onChange={event => setTenantId(event.target.value)}
          className='rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/40'
        >
          {tenants.map(tenant => (
            <option key={tenant._id} value={tenant._id}>
              {tenant.name} · {tenant.owner.slice(0, 6)}…
              {tenant.owner.slice(-4)}
            </option>
          ))}
        </select>
      </div>

      <div className='grid gap-2'>
        <label
          className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'
          htmlFor='api-key-label'
        >
          Label
        </label>
        <input
          id='api-key-label'
          value={label}
          onChange={event => setLabel(event.target.value)}
          placeholder='Example: policy-runner-prod'
          className='rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/40'
        />
      </div>

      <p className='text-xs text-muted-foreground'>
        API keys are displayed once. Copy and store them in your secure secrets
        manager after creation.
      </p>

      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='submit'
          disabled={pending}
          className='text-brand-teal-foreground inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 font-semibold transition hover:bg-brand-teal-light disabled:cursor-not-allowed disabled:opacity-60'
        >
          {pending ? 'Creating…' : 'Generate API key'}
        </button>
        {error ? <p className='text-xs text-destructive'>{error}</p> : null}
      </div>

      {latestKey ? (
        <div className='rounded-xl border border-brand-teal/30 bg-background/70 p-4 text-xs text-muted-foreground'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-teal'>
            New API key
          </p>
          <p className='mt-2 select-all break-all font-mono text-foreground'>
            {latestKey}
          </p>
          <button
            type='button'
            onClick={handleCopy}
            className='mt-3 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:border-brand-teal hover:text-brand-teal'
          >
            Copy key
          </button>
        </div>
      ) : null}
    </form>
  )
}
