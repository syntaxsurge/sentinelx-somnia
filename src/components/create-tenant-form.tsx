'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function CreateTenantForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      className='grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200'
    >
      <div className='flex flex-col gap-1'>
        <label
          htmlFor='tenant-name'
          className='text-xs font-semibold uppercase tracking-widest text-emerald-200'
        >
          Tenant name
        </label>
        <input
          id='tenant-name'
          value={name}
          onChange={event => setName(event.target.value)}
          required
          className='rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400'
        />
      </div>
      <div className='flex flex-col gap-1'>
        <label
          htmlFor='tenant-owner'
          className='text-xs font-semibold uppercase tracking-widest text-emerald-200'
        >
          Owner address
        </label>
        <input
          id='tenant-owner'
          value={owner}
          onChange={event => setOwner(event.target.value)}
          required
          className='rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400'
        />
      </div>
      <button
        type='submit'
        disabled={pending}
        className='rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60'
      >
        {pending ? 'Creating…' : 'Add tenant'}
      </button>
      {error ? <p className='text-xs text-red-300'>{error}</p> : null}
    </form>
  )
}
