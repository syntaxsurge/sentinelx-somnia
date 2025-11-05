import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/monitors', label: 'Monitors' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/actions', label: 'Actions' },
  { href: '/settings', label: 'Settings' },
  { href: '/docs', label: 'Docs' }
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className='hidden w-56 flex-none border-r border-border/60 bg-card/60 backdrop-blur lg:block'>
      <div className='flex h-14 items-center border-b border-border/80 px-6 text-sm font-semibold tracking-tight'>
        SentinelX
      </div>
      <nav className='flex flex-col gap-1 px-3 py-4 text-sm text-muted-foreground'>
        {navItems.map(item => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                active && 'bg-accent text-accent-foreground'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
