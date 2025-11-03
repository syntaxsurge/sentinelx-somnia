type EnvKey =
  | 'CONVEX_DEPLOYMENT_URL'
  | 'CONVEX_DEPLOYMENT'
  | 'NEXT_PUBLIC_SOMNIA_RPC_URL'

export function readEnv(key: EnvKey): string | undefined {
  const value = process.env[key] ?? process.env[`${key}_URL`]
  if (value && value.trim().length > 0) {
    return value
  }
  return undefined
}

export function requireEnv(key: EnvKey): string {
  const value = readEnv(key)
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}
