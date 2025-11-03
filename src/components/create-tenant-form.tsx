'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function CreateTenantForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [error, setError] = useState<string | null>(null)
  const disabled = !name || !owner || pending

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch('/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, owner })
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(
            payload?.error ?? `Request failed with status ${response.status}`
          )
        }

        setName('')
        setOwner('')
        router.refresh()
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='grid gap-4 rounded-2xl border border-border bg-card/70 p-5 text-sm text-foreground shadow-inner'
    >
      <div className='flex flex-col gap-2'>
        <label
          htmlFor='tenant-name'
          className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'
        >
          Tenant name
        </label>
        <input
          id='tenant-name'
          value={name}
          onChange={event => setName(event.target.value)}
          required
          placeholder='Example: Somnia Index Vaults'
          className='rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/40'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <label
          htmlFor='tenant-owner'
          className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'
        >
          Owner address
        </label>
        <input
          id='tenant-owner'
          value={owner}
          onChange={event => setOwner(event.target.value)}
          required
          placeholder='0x…'
          className='rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-xs text-foreground outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/40'
        />
      </div>
      <p className='text-xs text-muted-foreground'>
        SentinelX will scope monitors, incidents, and API keys to this tenant.
      </p>
      <button
        type='submit'
        disabled={disabled}
        className='text-brand-teal-foreground inline-flex w-max items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 font-semibold transition hover:bg-brand-teal-light disabled:cursor-not-allowed disabled:opacity-60'
      >
        {pending ? 'Creating…' : 'Add tenant'}
      </button>
      {error ? <p className='text-xs text-destructive'>{error}</p> : null}
    </form>
  )
}
