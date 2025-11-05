'use client'

import { useCallback } from 'react'

import { Button } from './button'
import { cn } from '@/lib/utils'

type CopyButtonProps = {
  value: string
  className?: string
  label?: string
}

export function CopyButton({ value, className, label }: CopyButtonProps) {
  const handleCopy = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    void navigator.clipboard.writeText(value)
  }, [value])

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      className={cn('gap-1 text-xs', className)}
      onClick={handleCopy}
    >
      {label ?? 'Copy'}
    </Button>
  )
}
