import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), usb=(), payment=(), accelerometer=(), autoplay=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=15552000; includeSubDomains'
  }
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'http',
        hostname: '**'
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/demo',
        destination: 'https://www.youtube.com/watch?v=sH3gxoT4rTM',
        permanent: false
      }
    ]
  },
  webpack(config) {
    return config
  }
}

export default nextConfig
