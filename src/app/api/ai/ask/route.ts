import { NextResponse } from 'next/server'

import { embedText, getOpenAI } from '@/lib/ai/openai'
import { docsCopilotFallback } from '@/lib/docs/copilot-fallback'
import { getConvexServerClient } from '@/lib/convexServer'

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function POST(request: Request) {
  const { question, limit = 5 } = await request.json()

  if (!question || typeof question !== 'string') {
    return NextResponse.json(
      { error: 'question must be provided' },
      { status: 400 }
    )
  }

  const embedding = await embedText(question)

  const convex = getConvexServerClient()
  const chunks = (await convex.query('docChunks:search' as any, {
    embedding,
    limit: 400
  })) as Array<{
    chunk: string
    embedding: number[]
    source: string
  }>

  let ranked = chunks
    .map(chunk => ({
      ...chunk,
      score: cosineSimilarity(embedding, chunk.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 8)))

  if (ranked.length === 0) {
    const normalized = question.toLowerCase()

    const scoredFallback = docsCopilotFallback
      .map(entry => {
        const hits = entry.keywords.reduce((score, keyword) => {
          return score + (normalized.includes(keyword.toLowerCase()) ? 1 : 0)
        }, 0)
        return { entry, hits }
      })
      .filter(item => item.hits > 0)
      .sort((a, b) => b.hits - a.hits)

    const fallbackSelection = (scoredFallback.length > 0
      ? scoredFallback.map(item => item.entry)
      : docsCopilotFallback
    ).slice(0, Math.max(1, Math.min(limit, 5)))

    ranked = fallbackSelection.map((entry, index) => ({
      chunk: entry.content,
      embedding: [],
      source: entry.source,
      score: scoredFallback.length > 0 ? 1 - index * 0.1 : 0.5 - index * 0.05
    })) as typeof ranked
  }

  const context = ranked
    .map(chunk => `Source: ${chunk.source}\n${chunk.chunk}`)
    .join('\n---\n')

  const client = getOpenAI()

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content:
          'You are SentinelX Docs Copilot. Rely strictly on provided context. If the answer is absent, say you do not have that information yet.'
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ]
  })

  const answer = response.output_text ?? 'No answer generated.'

  return NextResponse.json({
    answer,
    sources: ranked.map(r => ({ source: r.source, score: r.score }))
  })
}
