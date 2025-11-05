import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

import { embedText } from '@/lib/ai/openai'
import { getConvexClient } from '@/lib/convexClient'

function chunkText(input: string, maxLength = 900): string[] {
  const paragraphs = input.split(/\n{2,}/)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim()
    if (!trimmed) continue

    if ((current + '\n\n' + trimmed).length > maxLength) {
      if (current) chunks.push(current.trim())
      current = trimmed
    } else {
      current = current ? `${current}\n\n${trimmed}` : trimmed
    }
  }

  if (current) chunks.push(current.trim())
  return chunks
}

async function collectFiles(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  const docsDir = path.resolve(process.cwd(), 'docs')
  const convex = getConvexClient()
  const files = await collectFiles(docsDir)

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8')
    const chunks = chunkText(raw)
    const source = path.relative(docsDir, file)

    for (const chunk of chunks) {
      const hash = crypto
        .createHash('sha256')
        .update(`${source}:${chunk}`)
        .digest('hex')
      const embedding = await embedText(chunk)

      await convex.mutation('docChunks:ingest' as any, {
        source,
        chunk,
        hash,
        embedding
      })
    }

    console.log(`Ingested ${chunks.length} chunk(s) from ${source}`)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
