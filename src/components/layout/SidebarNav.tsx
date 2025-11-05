'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Settings,
  BookOpen,
  Home
} from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitors', label: 'Monitors', icon: Activity },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/actions', label: 'Actions', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/docs', label: 'Docs', icon: BookOpen }
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className='hidden w-64 flex-none border-r border-border/60 bg-card/50 backdrop-blur lg:block'>
      <Link
        href='/'
        className='flex h-16 items-center gap-3 border-b border-border/60 px-6 transition-colors hover:bg-accent/50'
      >
        <Image
          src='/images/sentinelx-logo.png'
          alt='SentinelX logo'
          width={40}
          height={40}
          className='h-10 w-10'
          priority
        />
        <div className='flex flex-col'>
          <span className='text-base font-bold tracking-tight text-foreground'>
            SentinelX
          </span>
          <span className='text-xs text-muted-foreground'>
            Somnia Guardian
          </span>
        </div>
      </Link>
      <nav className='flex flex-col gap-1 px-3 py-4'>
        {navItems.map(item => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className='h-5 w-5' />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
