import { randomBytes, createHash } from 'crypto'

const KEY_PREFIX = 'sx_'

export function generateApiKey(): { key: string; hash: string } {
  const entropy = randomBytes(24).toString('base64url')
  const key = `${KEY_PREFIX}${entropy}`
  return { key, hash: sha256(key) }
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}
