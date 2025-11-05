import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: []
  },
  resolve: {
    alias: [
      { find: '@/convex/_generated/api', replacement: path.resolve(__dirname, 'convex/_generated/api.js') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: /^@\/convex/, replacement: path.resolve(__dirname, 'convex') }
    ]
  }
})
