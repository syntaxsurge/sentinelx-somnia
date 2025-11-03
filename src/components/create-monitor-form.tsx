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
  defaults: {
    routerAddress?: string
    protofireFeed?: string
    diaFeed?: string
  }
}

export function CreateMonitorForm({ tenants, defaults }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    tenantId: tenants[0]?._id ?? '',
    contractAddress: '',
    guardianAddress: '',
    routerAddress: defaults.routerAddress ?? '',
    oracleKey: 'ETH/USD',
    protofireFeed: defaults.protofireFeed ?? '',
    diaFeed: defaults.diaFeed ?? '',
    maxDeviationBps: '100',
    staleAfterSeconds: '300'
  })
  const [error, setError] = useState<string | null>(null)
  const hasTenants = tenants.length > 0

  const updateField =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [key]: event.target.value }))
    }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch('/api/monitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            maxDeviationBps: Number(form.maxDeviationBps),
            staleAfterSeconds: Number(form.staleAfterSeconds)
          })
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(
            payload?.error ?? `Request failed with status ${response.status}`
          )
        }

        router.refresh()
        setForm(prev => ({
          ...prev,
          contractAddress: '',
          guardianAddress: ''
        }))
      } catch (err) {
        setError((err as Error).message)
      }
    })
  }

  if (!hasTenants) {
    return (
      <p className='text-sm text-slate-300'>
        Add a tenant before registering monitors.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200'
    >
      <div className='grid gap-1'>
        <label
          className='text-xs font-semibold uppercase tracking-widest text-emerald-200'
          htmlFor='monitor-tenant'
        >
          Tenant
        </label>
        <select
          id='monitor-tenant'
          value={form.tenantId}
          onChange={updateField('tenantId')}
          required
          className='rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400'
        >
          {tenants.map(tenant => (
            <option key={tenant._id} value={tenant._id}>
              {tenant.name} · {tenant.owner.slice(0, 6)}…
              {tenant.owner.slice(-4)}
            </option>
          ))}
        </select>
      </div>

      <div className='grid gap-1 md:grid-cols-2 md:gap-4'>
        <Field
          id='monitor-contract'
          label='Contract address'
          value={form.contractAddress}
          onChange={updateField('contractAddress')}
          required
        />
        <Field
          id='monitor-guardian'
          label='Guardian address'
          value={form.guardianAddress}
          onChange={updateField('guardianAddress')}
          required
        />
      </div>

      <div className='grid gap-1 md:grid-cols-2 md:gap-4'>
        <Field
          id='monitor-router'
          label='SafeOracleRouter address'
          value={form.routerAddress}
          onChange={updateField('routerAddress')}
          required
        />
        <Field
          id='monitor-oracle-key'
          label='Oracle key '
          value={form.oracleKey}
          onChange={updateField('oracleKey')}
          required
        />
      </div>

      <div className='grid gap-1 md:grid-cols-2 md:gap-4'>
        <Field
          id='monitor-protofire'
          label='Protofire feed address'
          value={form.protofireFeed}
          onChange={updateField('protofireFeed')}
          required
        />
        <Field
          id='monitor-dia'
          label='DIA feed address'
          value={form.diaFeed}
          onChange={updateField('diaFeed')}
          required
        />
      </div>

      <div className='grid gap-1 md:grid-cols-2 md:gap-4'>
        <Field
          id='monitor-deviation'
          label='Max deviation (bps)'
          type='number'
          min='10'
          max='2000'
          value={form.maxDeviationBps}
          onChange={updateField('maxDeviationBps')}
          required
        />
        <Field
          id='monitor-stale'
          label='Staleness window (seconds)'
          type='number'
          min='60'
          value={form.staleAfterSeconds}
          onChange={updateField('staleAfterSeconds')}
          required
        />
      </div>

      <div className='flex items-center gap-3'>
        <button
          type='submit'
          disabled={pending}
          className='rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60'
        >
          {pending ? 'Saving…' : 'Register monitor'}
        </button>
        {error ? <p className='text-xs text-red-300'>{error}</p> : null}
      </div>
    </form>
  )
}

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  type?: string
  min?: string
  max?: string
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  type = 'text',
  min,
  max
}: FieldProps) {
  return (
    <div className='flex flex-col gap-1'>
      <label
        htmlFor={id}
        className='text-xs font-semibold uppercase tracking-widest text-emerald-200'
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        type={type}
        min={min}
        max={max}
        className='rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400'
      />
    </div>
  )
}
