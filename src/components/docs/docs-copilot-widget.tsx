'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes
} from 'react'

import { cn } from '@/lib/utils'

import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card'

import 'highlight.js/styles/tokyo-night-dark.css'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
  sources?: Array<{ source: string; score: number }>
}

type DocsCopilotContextValue = {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  open: () => void
  close: () => void
  toggle: () => void
  sendQuestion: (question: string) => Promise<void>
  clearConversation: () => void
}

const DocsCopilotContext = createContext<DocsCopilotContextValue | null>(null)

const STORAGE_KEY = 'sentinelx.docsCopilot.messages'
const OPEN_KEY = 'sentinelx.docsCopilot.isOpen'

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
      'Hi, I’m the SentinelX Docs Copilot. Ask about monitors, incidents, automation, or integrations and I’ll answer from the embedded documentation.'
  }
]

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

function loadStoredMessages() {
  if (typeof window === 'undefined') return initialMessages
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return initialMessages
    const parsed = JSON.parse(stored) as ChatMessage[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return initialMessages
    }
    return parsed
  } catch {
    return initialMessages
  }
}

function loadStoredOpenState() {
  if (typeof window === 'undefined') return false
  try {
    const stored = window.localStorage.getItem(OPEN_KEY)
    if (!stored) return false
    return stored === 'true'
  } catch {
    return false
  }
}

export function DocsCopilotProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages)
  const [isOpen, setIsOpen] = useState<boolean>(loadStoredOpenState)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(OPEN_KEY, isOpen ? 'true' : 'false')
  }, [isOpen])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  const sendQuestion = useCallback(async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: trimmed })
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
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
  }, [])

  const clearConversation = useCallback(() => {
    setMessages(initialMessages)
  }, [])

  const value = useMemo(
    () => ({
      messages,
      isOpen,
      isLoading,
      open,
      close,
      toggle,
      sendQuestion,
      clearConversation
    }),
    [messages, isOpen, isLoading, open, close, toggle, sendQuestion, clearConversation]
  )

  return (
    <DocsCopilotContext.Provider value={value}>
      {children}
    </DocsCopilotContext.Provider>
  )
}

export function useDocsCopilot() {
  const context = useContext(DocsCopilotContext)
  if (!context) {
    throw new Error('useDocsCopilot must be used within DocsCopilotProvider')
  }
  return context
}

export function DocsCopilotWidget() {
  const { isOpen, open, close } = useDocsCopilot()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey)
    }
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, close])

  if (!isMounted) return null

  return (
    <div className='pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 font-sans sm:bottom-6 sm:right-6 md:bottom-8 md:right-8'>
      {isOpen ? (
        <div
          className='pointer-events-auto flex w-[min(420px,calc(100vw-1.5rem))] max-w-xl flex-col overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-2xl shadow-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/80'
          style={{ maxHeight: 'min(calc(100vh - 5rem), 560px)' }}
        >
          <CopilotChatPanel onClose={close} />
        </div>
      ) : null}
      <Button
        type='button'
        size='icon'
        onClick={() => (isOpen ? close() : open())}
        className='pointer-events-auto h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'
        aria-label={isOpen ? 'Close Docs Copilot' : 'Open Docs Copilot'}
      >
        <span className='text-base font-semibold'>SX</span>
      </Button>
    </div>
  )
}

function CopilotChatPanel({ onClose }: { onClose: () => void }) {
  const { messages, isLoading, sendQuestion, clearConversation } = useDocsCopilot()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  const disabled = isLoading || input.trim().length === 0
  const showQuickPrompts = messages.length <= 1

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return
    await sendQuestion(question)
    setInput('')
  }

  function handleQuickPrompt(prompt: string) {
    setInput(prompt)
  }

  return (
    <Card className='flex h-full flex-col border-0 bg-transparent text-sm text-foreground shadow-none'>
      <CardHeader className='space-y-3 border-b border-border/60 bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 px-5 py-4 backdrop-blur'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40'>
              SX
            </div>
            <div>
              <CardTitle className='text-base font-semibold'>Docs Copilot</CardTitle>
              <CardDescription className='text-xs text-muted-foreground'>
                Messenger-style assistant grounded in SentinelX docs.
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              onClick={clearConversation}
            >
              Reset
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 rounded-full px-3 text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
        {showQuickPrompts ? (
          <div className='flex flex-wrap gap-2'>
            {quickPrompts.map(prompt => (
              <Button
                key={prompt}
                type='button'
                variant='secondary'
                size='sm'
                className='h-8 rounded-full border border-border/60 bg-muted/60 px-3 text-[11px] font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:bg-muted/80 hover:text-foreground'
                onClick={() => handleQuickPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className='flex flex-1 flex-col space-y-4 bg-background/85 px-0 pb-0 pt-0 backdrop-blur-sm'>
        <div
          ref={scrollRef}
          className='flex min-h-[200px] flex-1 flex-col gap-4 overflow-y-auto px-5 py-5'
          style={{ maxHeight: 'min(55vh, 360px)' }}
        >
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading ? (
            <div className='flex justify-start pl-1'>
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
          className='sticky bottom-0 border-t border-border/60 bg-muted/30 px-5 py-4'
        >
          <div className='space-y-3'>
            <textarea
              rows={3}
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder='Ask about monitors, incidents, automation, or integration flows...'
              className='w-full resize-none rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0'
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  const question = input.trim()
                  if (question && !isLoading) {
                    void sendQuestion(question)
                    setInput('')
                  }
                }
              }}
            />
            <div className='flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground sm:flex-nowrap'>
              <span className='text-muted-foreground/80'>Shift + Enter for new line</span>
              <Button
                type='submit'
                disabled={disabled}
                className='rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40'
              >
                {isLoading ? 'Sending…' : 'Send'}
              </Button>
            </div>
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
          : 'mr-auto bg-muted/80 text-foreground'
      ),
    [isUser]
  )

  type MarkdownCodeProps = HTMLAttributes<HTMLElement> & {
    inline?: boolean
  }

  const markdownComponents = useMemo<Components>(
    () => ({
      pre: ({ node, ...props }) => (
        <pre
          className='max-h-64 overflow-x-auto overflow-y-auto rounded-xl border border-border/40 bg-background/80 p-4 text-xs text-muted-foreground'
          {...props}
        />
      ),
      code: ({ inline, className, children, ...props }: MarkdownCodeProps) => {
        const needsWrapper = !inline && !String(children).includes('\n')
        if (inline || needsWrapper) {
          return (
            <code
              className={cn('rounded-md bg-black/30 px-1.5 py-0.5 text-xs', className)}
              {...props}
            >
              {children}
            </code>
          )
        }
        return (
          <code className={cn('block text-xs leading-relaxed', className)} {...props}>
            {children}
          </code>
        )
      },
      p: ({ node, ...props }) => (
        <p className='whitespace-pre-wrap break-words text-sm leading-relaxed' {...props} />
      ),
      ul: ({ node, ...props }) => (
        <ul className='ml-4 list-disc space-y-1 text-sm text-foreground' {...props} />
      ),
      ol: ({ node, ...props }) => (
        <ol className='ml-4 list-decimal space-y-1 text-sm text-foreground' {...props} />
      ),
      table: ({ node, ...props }) => (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-xs' {...props} />
        </div>
      ),
      th: ({ node, ...props }) => (
        <th className='border border-border/30 bg-muted/50 px-2 py-1 text-left font-semibold' {...props} />
      ),
      td: ({ node, ...props }) => (
        <td className='border border-border/20 px-2 py-1 align-top text-foreground/90' {...props} />
      )
    }),
    []
  )

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className='flex flex-col gap-2'>
        <div className={classes}>
          {isUser ? (
            <p className='whitespace-pre-wrap break-words'>{message.content}</p>
          ) : (
            <div className='prose prose-invert max-w-none text-sm'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {message.sources && message.sources.length ? (
          <div className='flex flex-wrap gap-2 pl-1 text-[11px] text-muted-foreground'>
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
