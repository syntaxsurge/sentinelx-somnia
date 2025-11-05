import Link from 'next/link'

const footerLinks = [
  {
    label: 'Somnia Docs',
    href: 'https://docs.somnia.network'
  },
  {
    label: 'Explorer',
    href: 'https://shannon-explorer.somnia.network'
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/somnia'
  }
]

export function SiteFooter() {
  return (
    <footer className='border-t border-border/60 bg-background/70'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6'>
        <p className='text-xs uppercase tracking-[0.3em] text-muted-foreground'>
          SentinelX · Somnia Guardian Stack
        </p>
        <div className='flex flex-wrap items-center gap-4'>
          {footerLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              target='_blank'
              rel='noreferrer'
              className='hover:text-foreground'
            >
              {link.label}
            </a>
          ))}
          <Link href='/docs' className='hover:text-foreground'>
            Docs
          </Link>
        </div>
      </div>
    </footer>
  )
}
