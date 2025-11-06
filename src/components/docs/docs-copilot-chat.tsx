'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user' | 'system'
  content: string
  sources?: Array<{ source: string; score: number }>
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

const quickPrompts = [
  'How do I schedule the indexer on Vercel?',
  'What payload do I send to create a monitor?',
  'How are guardian approvals recorded?'
]

const initialMessages: ChatMessage[] = [
  {
    id: 'intro',
    role: 'assistant',
    content:
      'Hi, I am the SentinelX Docs Copilot. Ask me anything about monitors, incidents, webhooks, or automation and I will answer based on the documentation shown here.'
  }
]

export function DocsCopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const disabled = isLoading || input.trim().length === 0

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: question
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question })
      })

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`)
      }

      const data = (await response.json()) as {
        answer: string
        sources?: Array<{ source: string; score: number }>
      }

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: data.answer.trim() || 'I could not find that in the docs.',
        sources: data.sources?.length ? data.sources : undefined
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content:
          error instanceof Error
            ? `I ran into an issue fetching the docs: ${error.message}`
            : 'I ran into an unexpected issue reaching the docs service.'
      }

      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  function handleQuickPrompt(prompt: string) {
    setInput(prompt)
  }

  return (
    <Card className='overflow-hidden border border-border/60 bg-background/95 shadow-lg shadow-black/10 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
      <CardHeader className='space-y-3 border-b border-border/60 bg-muted/30'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm'>
            SX
          </div>
          <div>
            <CardTitle>Docs Copilot</CardTitle>
            <CardDescription>
              Messenger-style assistant grounded in your SentinelX docs.
            </CardDescription>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          {quickPrompts.map(prompt => (
            <Button
              key={prompt}
              type='button'
              variant='secondary'
              size='sm'
              className='border border-border/60 bg-muted/60 text-xs text-muted-foreground hover:bg-muted/80'
              onClick={() => handleQuickPrompt(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className='space-y-4 p-0'>
        <div
          ref={scrollRef}
          className='flex max-h-[440px] min-h-[360px] flex-col gap-4 overflow-y-auto bg-gradient-to-b from-background/60 via-background to-background px-6 py-6'
        >
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading ? (
            <div className='flex justify-start'>
              <div className='flex items-center gap-2 rounded-full bg-muted/70 px-3 py-2 text-xs text-muted-foreground shadow-sm'>
                <span className='relative flex h-2 w-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-primary' />
                </span>
                Thinking...
              </div>
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4'
        >
          <textarea
            rows={3}
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder='Ask about monitors, incidents, automation, or integration flows...'
            className='w-full resize-none rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0'
          />
          <div className='flex items-center justify-end gap-3'>
            <Button
              type='submit'
              disabled={disabled}
              className='rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40'
            >
              {isLoading ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const classes = useMemo(
    () =>
      cn(
        'relative max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all',
        isUser
          ? 'ml-auto bg-primary text-primary-foreground shadow-primary/20'
          : 'mr-auto bg-muted/70 text-foreground'
      ),
    [isUser]
  )

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className='flex flex-col gap-2'>
        <div className={classes}>
          <p>{message.content}</p>
        </div>
        {message.sources && message.sources.length ? (
          <div className='flex flex-wrap gap-2 text-[11px] text-muted-foreground'>
            {message.sources.map(source => (
              <div
                key={`${message.id}-${source.source}`}
                className='rounded-full border border-border/40 bg-background/80 px-3 py-1 shadow-sm'
              >
                {formatSource(source)}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function formatSource(source: { source: string; score: number }) {
  const score = source.score.toFixed(2)
  return `${source.source} · ${score}`
}
