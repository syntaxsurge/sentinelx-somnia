import { type ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className='rounded-lg border border-border/60 bg-muted/30 p-6'>
      {children}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='space-y-3 flex-1'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-10 w-72' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-10 w-40' />
          <Skeleton className='h-10 w-32' />
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <SectionCard key={index}>
            <div className='space-y-3'>
              <Skeleton className='h-4 w-1/2' />
              <Skeleton className='h-6 w-1/3' />
              <Skeleton className='h-3 w-2/3' />
            </div>
          </SectionCard>
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <SectionCard>
          <div className='space-y-4'>
            <Skeleton className='h-6 w-40' />
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div className='flex items-center gap-3' key={index}>
                  <Skeleton className='h-10 w-10 rounded-lg' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-2/3' />
                    <Skeleton className='h-3 w-1/2' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className='space-y-4'>
            <Skeleton className='h-6 w-40' />
            <div className='space-y-2'>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className='h-12 w-full rounded-md' />
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className='space-y-4'>
            <Skeleton className='h-6 w-36' />
            <div className='space-y-4'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div className='space-y-2' key={index}>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-2/4' />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <div className='space-y-4'>
          <Skeleton className='h-6 w-48' />
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div className='space-y-2' key={index}>
                <Skeleton className='h-4 w-2/3' />
                <Skeleton className='h-3 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export function MonitorsSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='space-y-3 flex-1'>
          <Skeleton className='h-10 w-72' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-40' />
        </div>
      </div>
      <SectionCard>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className='h-12 w-full rounded-md' />
          ))}
        </div>
      </SectionCard>
      <SectionCard>
        <div className='space-y-3'>
          <Skeleton className='h-5 w-36' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      </SectionCard>
    </div>
  )
}

export function IncidentsSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Skeleton className='h-10 w-60' />
        <Skeleton className='h-4 w-96' />
      </div>
      <SectionCard>
        <div className='space-y-4'>
          <Skeleton className='h-5 w-48' />
          <div className='space-y-2'>
            <Skeleton className='h-10 w-full rounded-md' />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className='h-16 w-full rounded-md' />
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export function ActionsSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='space-y-3'>
        <Skeleton className='h-10 w-60' />
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionCard key={index}>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-8 w-8 rounded-lg' />
                <div className='space-y-2 flex-1'>
                  <Skeleton className='h-4 w-2/3' />
                  <Skeleton className='h-3 w-1/3' />
                </div>
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-32 w-full rounded-md' />
              <div className='flex gap-2'>
                <Skeleton className='h-9 w-24 rounded-md' />
                <Skeleton className='h-9 w-24 rounded-md' />
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-44' />
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='grid gap-6 lg:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, index) => (
          <SectionCard key={index}>
            <div className='space-y-4'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-3/4' />
              <div className='space-y-3'>
                {Array.from({ length: 3 }).map((__, innerIndex) => (
                  <Skeleton key={innerIndex} className='h-10 w-full rounded-md' />
                ))}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

export function DocsSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <Skeleton className='h-9 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-4 w-64' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-32' />
        </div>
      </div>
      <div className='space-y-6'>
        {Array.from({ length: 4 }).map((_, index) => (
          <SectionCard key={index}>
            <div className='space-y-3'>
              <Skeleton className='h-6 w-56' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-32 w-full rounded-md' />
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
