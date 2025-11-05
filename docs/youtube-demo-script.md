# SentinelX Demo Video Script (Concise)

Fast, task‑first walkthrough of the infrastructure + AI agent workflow. Skip wallet/auth; go straight to pages, actions, and exact inputs.

What you’ll see (Infra + AI):
- Data plane (indexer): Polls SafeOracleRouter, stores telemetry, opens incidents.
- AI plane (triage + plan): Generates severity, root cause, mitigations; proposes action intents.
- Control plane (approvals + exec): Human approval and on‑chain execution via AgentInbox/GuardianHub.

---

## 1) Dashboard (start at `/dashboard`)

- On-screen: Show KPI cards, Monitors table, Daily brief, and Action queue.
- Action: Click “Run policy evaluation”. A toast confirms; Daily brief/Incidents update.
- Callout: Data plane — triggers `/api/indexer/run` to evaluate monitors and write telemetry/incidents.

## 2) Register a Monitor (`/monitors/new`)

Fill the form exactly, then Submit:
- Monitor name → `Somnia ETH/USD router guard`
- Guarded contract → `0x761D0dbB45654513AdF1BF6b5D217C0f8B3c5737`
- Guardian hub → `0x9a667b845034dDf18B7a5a9b50e2fe8CD4e6e2C1`
- SafeOracleRouter → `0xF5FCDBe9d4247D76c7fa5d2E06dBA1e77887F518`
- Oracle pair → select `ETH/USD`
- Protofire aggregator → `0xd9132c1d762D432672493F640a63B758891B449e` (prefilled)
- DIA adapter → `0x786c7893F8c26b80d42088749562eDb50Ba9601E` (prefilled)
- Max deviation (bps) → `100`
- Stale after (s) → `180`

Then open `/monitors` to show the row with status and last evaluation.

## 3) Create incidents via the agent

- On-screen: Back to `/dashboard`, click “Run policy evaluation”.
- Result: New incident appears in “Recent incidents” and “Daily brief”.
- Callout: AI plane — incident includes AI Summary (severity, root cause, mitigations) from the agent.

## 4) Incident review (`/incidents` → click one row)

- On-screen: Incident detail shows AI Summary (severity, root cause, mitigations), Telemetry snapshot, and Action intents.
- Action: Click “Generate new plan”. New intent(s) appear with rationale and calldata when applicable.
- Callout: AI plane — planner tool‑calls propose `pause` or parameter updates as Action Intents.

## 5) Approve and mark execution (`/actions`)

- On-screen: Find the proposed intent.
- Action: Click “Approve”.
- Action: Paste tx hash from GuardianHub/AgentInbox execution → e.g. `0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
- Action: Click “Mark executed”. State flips to Executed.
- Callout: Control plane — operator approval plus recorded tx hash delivers safe autonomy.

## 6) Docs (`/docs`)

- On-screen: Show the cron snippet and the Docs Copilot.
- Cron:
  - Path: `/api/indexer/run`
  - Schedule: `*/1 * * * *`
- Ask Copilot example: “How do I schedule the indexer on Vercel?”
 - Callout: Data + AI — docs are embedded for grounded answers; cron keeps AI insights fresh.

## 7) Settings (optional, 15s)

- API Keys: Label → `policy-runner-prod` → Generate → copy plaintext → confirm hashed row.
- Webhooks: Kind `Slack`, Label `Ops Slack`, Destination URL `https://hooks.slack.example/services/T000.../B000.../XXXXXXXX`, Secret `sentinelx-demo-secret` → Save.
- Guardian operators: Address `0x1111111111111111111111111111111111111111`, Role `Tier 1 operator` → Add.

Done. The demo covered: add monitor, run agent, review incident with AI summary, generate/approve actions, and show cron/docs.
