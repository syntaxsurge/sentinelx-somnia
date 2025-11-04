const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export function isAddress(value: unknown): value is `0x${string}` {
  return typeof value === 'string' && ADDRESS_REGEX.test(value)
}

export function sanitizeAddress(value: string): string {
  return value.trim()
}

export function isPositiveInteger(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0
  }
  return false
}
