# SentinelX

SentinelX is an infrastructure layer that protects Somnia builders from oracle
drift and stale data. We are assembling a guarded price surface, guardian
automation, and a Convex-backed observability layer for Somnia applications.

## Feature overview

- **Safe price surfaces** – `SafeOracleRouter` merges Protofire + DIA price
  sources on Somnia Shannon Testnet and exposes freshness/deviation flags for
  SentinelX monitors.
- **AI incident triage** – The indexer (`/api/indexer/run` or `pnpm policy:run`)
  analyzes every monitor pass, calls OpenAI for summaries + mitigations, and
  opens incidents with severity, root cause, and advisory tags.
- **Action queue & AgentInbox** – Action intents store AI playbooks including
  GuardianHub calldata (e.g. `pause(address target)`). Operators approve and
  record execution hashes before AgentInbox relays on-chain.
- **Telemetry & observability** – Convex tracks telemetry rows, incident
  timelines, approvals, and status transitions so the dashboard daily brief,
  monitors table, and incident console stay fresh.
- **Docs copilot** – `/docs` includes an embedded AI copilot backed by Convex
  vector search over local markdown (`pnpm docs:ingest`).
- **Credential & auth surface** – RainbowKit/Wagmi + SIWE handle wallet auth,
  and Settings manages API keys, webhooks, and Guardian operators with hashed
  storage and single-view plaintext.

## Milestone log

- **Phase 1** – SafeOracleRouter + GuardianHub integration, Convex tenancy, and
  RainbowKit/SIWE authentication.
- **Phase 2** – AI-powered incident pipeline (summaries, mitigations, action
  intents) with telemetry storage and AgentInbox contract.
- **Phase 3** – Sidebar dashboard redesign, incidents/actions consoles, Docs
  Copilot, and vectorized documentation ingestion.

## Quick start

```bash
pnpm install
pnpm dev               # launches Next.js
pnpm test:e2e          # run Vitest end-to-end checks (auth + policy runner)
pnpm docs:ingest       # optional - embed docs for the AI copilot

# In another terminal (optional for contract interaction)
cd blockchain
pnpm install
pnpm compile
```

Visit `http://localhost:3000` to review the current SentinelX overview and
dashboard (`/dashboard`).

## Environment variables

Copy `.env.example` to `.env.local` and set the following values:

```env
NEXT_PUBLIC_APP_NAME=SentinelX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_WALLETCONNECT_ID=your_walletconnect_project_id
CONVEX_DEPLOYMENT=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
OPENAI_API_KEY=sk-...
SESSION_SECRET=32+character_random_secret
SENTINELX_ROUTER_ADDRESS=0xrouterAddress
AGENT_INBOX_ADDRESS=0xinboxAddress
```

`SENTINELX_ROUTER_ADDRESS` is used when monitors omit an explicit router.
`AGENT_INBOX_ADDRESS` points UI affordances at the deployed AgentInbox. Provide
`CONVEX_DEPLOYMENT` or `NEXT_PUBLIC_CONVEX_URL` so both server routes and
client components can resolve the Convex instance.

If `NEXT_PUBLIC_WALLETCONNECT_ID` is omitted locally the app falls back to a
demo project id and logs a warning—replace it with your WalletConnect Cloud id
before production.

- `NEXT_PUBLIC_WALLETCONNECT_ID`: visit
  [cloud.walletconnect.com](https://cloud.walletconnect.com/app), create a free
  project, and paste the Project ID value here.
- `SESSION_SECRET`: generate a 32+ character random string (for example,
  `openssl rand -hex 32`). SentinelX generates a throwaway value in development
  if you omit it, but production builds must set it explicitly.

## Repository layout

- `src/app` – Next.js App Router (AppShell, dashboard, monitors, incidents,
  actions, settings, docs, API routes).
- `convex` – Schema and functions for tenants, monitors, telemetry, incidents,
  action intents, doc embeddings, API keys, webhooks, guardians, and users.
- `src/jobs` – Shared indexer logic consumed by the CLI (`policy:run`) and
  serverless endpoint (`/api/indexer/run`).
- `blockchain` – Hardhat workspace with SentinelX contracts (SafeOracleRouter,
  GuardianHub, AgentInbox) and tests.
- `scripts` – Utilities for ABI sync, Convex dev tasks, policy runner CLI, and
  documentation ingestion (`pnpm docs:ingest`).

## Security checklist

- Never commit private keys. The Hardhat workspace reads `PRIVATE_KEY` and
  `SOMNIA_RPC_URL` from `blockchain/.env`.
- Run `pnpm lint:check-solidity` inside `blockchain/` after editing contracts.
- Execute `pnpm typecheck` from the repo root before publishing changes.
- Run `pnpm lint`, `pnpm test:e2e`, and `pnpm --filter sentinelx-hardhat test`
  (or `cd blockchain && pnpm test`) prior to release.

## Next steps

Upcoming milestones include:

- Broader monitor types (latency, log volume) feeding the same AI pipeline.
- Native execution from AgentInbox with generated calldata for additional
  GuardianHub methods.
- Slack/Discord webhook templates that consume incident + action intent data.
- Visualization overlays (sparklines, histograms) powered by the telemetry
  table.
