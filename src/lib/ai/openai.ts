import OpenAI from 'openai'

let client: OpenAI | null = null

function ensureClient(): OpenAI {
  if (client) return client
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY must be set to use SentinelX AI features.')
  }
  client = new OpenAI({ apiKey })
  return client
}

export function getOpenAI() {
  return ensureClient()
}

type IncidentSummaryInput = {
  monitor: {
    id: string
    name: string
    type: string
    oracleKey: string
    guardianAddress: string
    routerAddress: string
  }
  latestTelemetry: Array<{
    ts: number
    source: string
    datapoint: unknown
    meta?: Record<string, unknown>
  }>
  recentIncidents: Array<{
    openedAt: number
    status: string
    severity: string
    summary: string
  }>
  anomaly: Record<string, unknown>
}

export async function generateIncidentSummary(input: IncidentSummaryInput) {
  const client = ensureClient()

  const prompt = [
    {
      role: 'system' as const,
      content:
        'You are SentinelX, an on-chain site reliability co-pilot. Analyse Somnia telemetry and produce succinct, actionable incident intelligence. Respond in JSON with keys summary,severity,root_cause,mitigations,tags and keep mitigations to at most three bullet strings.'
    },
    {
      role: 'user' as const,
      content: JSON.stringify(input)
    }
  ]

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
    response_format: { type: 'json_object' },
    max_output_tokens: 600
  } as any)

  const payload = (response as any).output_text
  if (!payload) {
    throw new Error('OpenAI returned empty payload for incident summary.')
  }

  return JSON.parse(payload) as {
    summary: string
    severity: string
    root_cause: string
    mitigations: string[]
    tags?: string[]
  }
}

type PlanToolCall =
  | {
      name: 'propose_pause_market'
      arguments: { target: string; rationale: string }
    }
  | {
      name: 'propose_set_limit'
      arguments: { target: string; param: string; value: string; rationale: string }
    }

type PlanInput = {
  incident: {
    summary: string
    severity: string
    root_cause: string
    mitigations: string[]
    monitor: {
      contractAddress: string
      guardianAddress: string
      routerAddress: string
      name: string
      oracleKey: string
    }
  }
}

const plannerTools = [
  {
    type: 'function' as const,
    function: {
      name: 'propose_pause_market',
      description:
        'Propose pausing a guarded contract via GuardianHub when market conditions are unsafe.',
      parameters: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description: 'GuardianHub contract address that can execute pause.'
          },
          rationale: { type: 'string' }
        },
        required: ['target', 'rationale']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'propose_set_limit',
      description:
        'Recommend updating a limit parameter on the SafeOracleRouter or dependent contracts.',
      parameters: {
        type: 'object',
        properties: {
          target: { type: 'string', description: 'Contract to call.' },
          param: {
            type: 'string',
            description: 'Identifier for parameter being tuned.'
          },
          value: {
            type: 'string',
            description: 'New value expressed as string.'
          },
          rationale: { type: 'string' }
        },
        required: ['target', 'param', 'value', 'rationale']
      }
    }
  }
]

export async function generateActionPlan(input: PlanInput) {
  const client = ensureClient()

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content:
          'You are SentinelX guardian co-pilot. Propose safe, reversible mitigations. Avoid redundant actions and mandate human approval.'
      },
      {
        role: 'user',
        content: JSON.stringify(input)
      }
    ],
    tools: plannerTools as any
  } as any)

  const calls = ((response as any).output?.[0]?.tool_calls ?? []) as any[]
  const parsed = calls.map((call: any) => ({
    name: call.function?.name as PlanToolCall['name'],
    arguments: call.function?.arguments as PlanToolCall['arguments']
  })) as PlanToolCall[]

  return parsed
}

export async function embedText(input: string) {
  const client = ensureClient()
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input
  })
  return response.data[0]?.embedding ?? []
}
