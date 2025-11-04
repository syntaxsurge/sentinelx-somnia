'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { isAddress, isPositiveInteger, sanitizeAddress } from '@/lib/validation'

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

    const contract = sanitizeAddress(form.contractAddress)
    const guardian = sanitizeAddress(form.guardianAddress)
    const routerAddress = sanitizeAddress(form.routerAddress)
    const protofire = sanitizeAddress(form.protofireFeed)
    const dia = sanitizeAddress(form.diaFeed)

    if (!isAddress(contract)) {
      setError('Guarded contract address is invalid.')
      return
    }
    if (!isAddress(guardian)) {
      setError('Guardian hub address is invalid.')
      return
    }
    if (!isAddress(routerAddress)) {
      setError('SafeOracleRouter address is invalid.')
      return
    }
    if (!isAddress(protofire)) {
      setError('Protofire feed address is invalid.')
      return
    }
    if (!isAddress(dia)) {
      setError('DIA feed address is invalid.')
      return
    }
    if (!isPositiveInteger(form.maxDeviationBps)) {
      setError('Max deviation must be a positive integer.')
      return
    }
    if (!isPositiveInteger(form.staleAfterSeconds)) {
      setError('Staleness window must be a positive integer.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/monitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            contractAddress: contract,
            guardianAddress: guardian,
            routerAddress,
            protofireFeed: protofire,
            diaFeed: dia,
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
      <p className='text-sm text-muted-foreground'>
        Add a tenant before registering monitors.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='grid gap-6 rounded-2xl border border-border bg-card/70 p-5 text-sm text-foreground shadow-inner'
    >
      <p className='text-xs text-muted-foreground'>
        Monitors evaluate a guarded contract against the paired Protofire and
        DIA feeds. All fields below map directly to Convex records and on-chain
        transactions.
      </p>

      <div className='grid gap-1'>
        <label
          className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'
          htmlFor='monitor-tenant'
        >
          Tenant
        </label>
        <select
          id='monitor-tenant'
          value={form.tenantId}
          onChange={updateField('tenantId')}
          required
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

      <div className='grid gap-4 md:grid-cols-2'>
        <Field
          id='monitor-contract'
          label='Guarded contract'
          description='The contract SentinelX should observe (implements GuardablePausable).'
          value={form.contractAddress}
          onChange={updateField('contractAddress')}
          required
        />
        <Field
          id='monitor-guardian'
          label='Guardian hub'
          description='GuardianHub or guardian EOA allowed to call pause/unpause.'
          value={form.guardianAddress}
          onChange={updateField('guardianAddress')}
          required
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Field
          id='monitor-router'
          label='SafeOracleRouter'
          description='Address of the deployed SentinelX router.'
          value={form.routerAddress}
          onChange={updateField('routerAddress')}
          required
        />
        <Field
          id='monitor-oracle-key'
          label='Oracle key'
          description='UTF-8 string hashed to bytes32. Example: ETH/USD.'
          value={form.oracleKey}
          onChange={updateField('oracleKey')}
          required
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Field
          id='monitor-protofire'
          label='Protofire feed'
          description='AggregatorV3 feed address from Protofire Chainlink.'
          value={form.protofireFeed}
          onChange={updateField('protofireFeed')}
          required
        />
        <Field
          id='monitor-dia'
          label='DIA feed'
          description='DIA adapter implementing AggregatorV3 interface.'
          value={form.diaFeed}
          onChange={updateField('diaFeed')}
          required
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Field
          id='monitor-deviation'
          label='Max deviation (bps)'
          description='1% = 100 basis points. Policy flags values above this threshold.'
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
          description='If either feed updates after this window, the policy marks it stale.'
          type='number'
          min='60'
          value={form.staleAfterSeconds}
          onChange={updateField('staleAfterSeconds')}
          required
        />
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='submit'
          disabled={pending}
          className='text-brand-teal-foreground inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 font-semibold transition hover:bg-brand-teal-light disabled:cursor-not-allowed disabled:opacity-60'
        >
          {pending ? 'Saving…' : 'Register monitor'}
        </button>
        {error ? <p className='text-xs text-destructive'>{error}</p> : null}
      </div>
    </form>
  )
}

type FieldProps = {
  id: string
  label: string
  description?: string
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
  description,
  value,
  onChange,
  required,
  type = 'text',
  min,
  max
}: FieldProps) {
  return (
    <div className='flex flex-col gap-2'>
      <label
        htmlFor={id}
        className='text-xs font-semibold uppercase tracking-[0.35em] text-brand-teal'
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
        placeholder='0x…'
        className='rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/40'
      />
      {description ? (
        <p className='text-xs text-muted-foreground'>{description}</p>
      ) : null}
    </div>
  )
}
