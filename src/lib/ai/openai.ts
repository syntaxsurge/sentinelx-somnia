import OpenAI from 'openai'

let client: OpenAI | null = null

const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY)

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

function fallbackIncidentSummary(input: IncidentSummaryInput) {
  const safe = Boolean((input.anomaly as any)?.safe)
  const bothFresh = Boolean((input.anomaly as any)?.bothFresh)

  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (!safe && bothFresh) {
    severity = 'critical'
  } else if (!safe) {
    severity = 'high'
  } else if (!bothFresh) {
    severity = 'medium'
  }

  const summary = safe
    ? `${input.monitor.name} (${input.monitor.oracleKey}) is within SentinelX policy thresholds.`
    : `SentinelX detected a deviation on ${input.monitor.name} (${input.monitor.oracleKey}) guarded by ${input.monitor.guardianAddress}.`

  const rootCause = safe
    ? 'Oracle deviation and freshness checks completed without anomalies.'
    : bothFresh
      ? 'Oracle answers diverged while both feeds were fresh.'
      : 'At least one oracle feed exceeded the allowed freshness window.'

  const mitigations = safe
    ? [
        'Continue monitoring telemetry and guardian approvals.',
        'Leave SentinelX policy runner scheduled on cron.'
      ]
    : [
        'Pause the guarded contract via GuardianHub to halt automation.',
        'Ping guardian operators to review upstream oracle feeds.',
        'Re-run SentinelX policy after feeds stabilise.'
      ]

  const tags = [
    `oracle:${input.monitor.oracleKey}`,
    safe ? 'status:safe' : 'status:unsafe',
    bothFresh ? 'feeds:fresh' : 'feeds:stale'
  ]

  return {
    summary,
    severity,
    root_cause: rootCause,
    mitigations,
    tags
  }
}

export async function generateIncidentSummary(input: IncidentSummaryInput) {
  if (!hasOpenAIKey) {
    return fallbackIncidentSummary(input)
  }

  try {
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
  } catch (error) {
    console.warn('Falling back to deterministic incident summary:', error)
    return fallbackIncidentSummary(input)
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

function fallbackActionPlan(input: PlanInput): PlanToolCall[] {
  const severity = input.incident.severity.toLowerCase()
  if (severity === 'low' || severity === 'medium') {
    return []
  }

  return [
    {
      name: 'propose_pause_market',
      arguments: {
        target: input.incident.monitor.guardianAddress,
        rationale: `Pause ${input.incident.monitor.name} until oracle conditions stabilise.`
      }
    }
  ]
}

export async function generateActionPlan(input: PlanInput) {
  if (!hasOpenAIKey) {
    return fallbackActionPlan(input)
  }

  try {
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

    if (parsed.length === 0) {
      return fallbackActionPlan(input)
    }

    return parsed
  } catch (error) {
    console.warn('Falling back to deterministic action plan:', error)
    return fallbackActionPlan(input)
  }
}

export async function embedText(input: string) {
  if (!hasOpenAIKey) {
    const pseudoVector = new Array(10).fill(0).map((_, idx) => (idx + 1) / 10)
    return pseudoVector
  }

  const client = ensureClient()
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input
  })
  return response.data[0]?.embedding ?? []
}
