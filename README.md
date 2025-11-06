# SentinelX — Reliability Layer for Somnia Oracles

SentinelX is a Somnia-native guardrail that keeps oracle-driven dApps honest.
It compares Protofire (Chainlink) and DIA feeds, turns the deviation/heartbeat
model into incidents, and lets human operators approve the on-chain fix through
GuardianHub + AgentInbox.

---

## Problem & Solution

### The reliability gap on Somnia

- **Deviation + heartbeat ≠ real-time** – Chainlink-style feeds update when a
  deviation threshold or heartbeat hits. On Somnia, DIA recommends ~0.5%
  deviation with a 120s refresh and 24h heartbeat, so “valid” prices can still
  be stale.
- **Manipulation & MEV pressure** – Flash loans and MEV can skew prices long
  enough to drain liquidity pools. Mature protocols rely on circuit breakers
  and guardians, but most teams don’t ship the surrounding SRE tooling.
- **Missing runbooks** – Comparing feeds, drafting mitigations, approving
  on-chain actions, and logging audit trails takes time teams don’t have.

### SentinelX response

1. **Multi-source guardrails** – Monitors enforce deviation and heartbeat
   health across DIA + Protofire/Chainlink feeds, opening incidents when values
   drift or go stale.
2. **Data → AI → Control** – The policy runner writes telemetry, the AI layer
   drafts severity/root-cause/mitigation summaries plus Action Intents, and the
   control plane executes via GuardianHub after operator approval.
3. **Somnia-first defaults** – Contracts, RPC URLs, and demo toggles ship in the
   env template; operators can dive straight into the dashboard without wiring
   addresses manually.
4. **Auditability** – Every propose → approve → execute step is recorded with
   transaction hashes so teams can prove they handled outages safely.

---

## Layman’s End-to-End Flow

1. **Install & register** – Install SentinelX and register your vault,
   marketplace, or other guardable contract in the web app.
2. **Wire the pause hook** – Inherit the GuardablePausable mixin (or paste the
   helper) so GuardianHub can pause when risk is detected.
3. **Read two feeds** – SentinelX watches Protofire + DIA for the same asset and
   flags “Unsafe” if prices diverge or go stale.
4. **AI policy agent** – Simple rules plus an LLM summary decide whether to
   pause and draft mitigations.
5. **Operator control** – The dashboard shows incident timelines, approvals,
   and offers one-click unpause when conditions recover.
6. **SafePrice output** – Exposure to a single oracle drops; apps can surface
   the guarded SafePrice to end users.

---

## Feature Overview

- **Safe price surfaces** – `SafeOracleRouter` merges Protofire + DIA feeds on
  Somnia Shannon and returns deviation/freshness flags for each monitor.
- **AI incident triage** – The indexer (`/api/indexer/run` or `pnpm policy:run`)
  evaluates monitors, calls OpenAI (with deterministic fallbacks), and opens
  incidents with severity, root cause, mitigations, and advisory tags.
- **Action queue & AgentInbox** – Action intents store GuardianHub calldata
  (pause, tune params). Operators approve, execute, and SentinelX records tx
  hashes for auditability.
- **Telemetry & observability** – Convex persists telemetry rows, incident
  timelines, approvals, and status transitions, powering the dashboard and
  timeline views.
- **Docs Copilot everywhere** – A Messenger-style chat head lives bottom-right
  across the entire app. It uses `/api/ai/ask`, Convex embeddings, and a
  curated fallback corpus, with quick prompts, markdown rendering, and local
  history.
- **Credentials & auth** – RainbowKit + Wagmi v2 run SIWE; Settings issues
  tenant-scoped API keys and webhooks (hashed, single-view plaintext).

---

## Quick Start

```bash
pnpm install
pnpm dev                # Next.js app with App Router
pnpm docs:ingest        # optional – embed docs for the Copilot

# Optional: run the policy runner or contracts
pnpm policy:run         # CLI agent loop (needs API key + env)
cd blockchain && pnpm install && pnpm compile
```

Visit `http://localhost:3000` and connect a Somnia wallet with RainbowKit.

---

## Environment Variables

1. Copy `.env.example` → `.env.local` (Next.js) and, if needed,
   `blockchain/.env.example` → `blockchain/.env`.
2. Populate the following keys:

```env
NEXT_PUBLIC_APP_NAME=SentinelX
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Somnia Testnet
NEXT_PUBLIC_SOMNIA_CHAIN_ID=50312
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_SOMNIA_EXPLORER_URL=https://shannon-explorer.somnia.network

# Oracle addresses (Shannon Testnet defaults, override for mainnet)
NEXT_PUBLIC_PROTOFIRE_ETH_USD=0xd9132c1d762D432672493F640a63B758891B449e
NEXT_PUBLIC_DIA_WETH_USD=0x786c7893F8c26b80d42088749562eDb50Ba9601E

# SentinelX contracts (fill after deployment)
NEXT_PUBLIC_GUARDIAN_HUB=
NEXT_PUBLIC_AGENT_INBOX=
NEXT_PUBLIC_SAFE_ORACLE_ROUTER=
NEXT_PUBLIC_DEMO_ORACLE=
NEXT_PUBLIC_DEMO_PAUSABLE=

# Auth & services
NEXT_PUBLIC_WALLETCONNECT_ID=your_walletconnect_project_id
SESSION_SECRET=openssl rand -hex 32
OPENAI_API_KEY=sk-...

# Optional toggles
NEXT_PUBLIC_DEMO_MODE=true
```

- Provide a WalletConnect ID from
  [cloud.walletconnect.com](https://cloud.walletconnect.com/app) for production.
- Demo mode enables the dashboard “Simulate incident” button and `/api/demo/simulate`.
- For contract deployment and policy runner automation set `SOMNIA_RPC_URL`,
  `SOMNIA_PRIVATE_KEY`, and `EXECUTOR_PRIVATE_KEY` in the appropriate `.env`.

---

## Repository Layout

- `src/app` – Next.js App Router (AppShell, dashboard, monitors, incidents,
  actions, settings, docs, API routes).
- `src/components/docs` – Messenger-style Docs Copilot widget shared across the
  app.
- `src/jobs` – Indexer + AI orchestration shared by CLI and API.
- `convex` – Schema/functions for tenants, monitors, telemetry, incidents,
  action intents, doc embeddings, API keys, webhooks, guardians, users.
- `blockchain` – Hardhat contracts (`GuardianHub`, `SafeOracleRouter`,
  `AgentInbox`, demos) + tests.
- `scripts` – Convex helpers, policy runner, deploy scripts, docs ingestion.

---

## Security & Quality Checklist

- **Secrets** – Never commit private keys. Hardhat reads `SOMNIA_PRIVATE_KEY`
  and `SOMNIA_RPC_URL` from `blockchain/.env`.
- **Type safety** – Run `pnpm typecheck` before opening a PR.
- **Lint/tests** – `pnpm lint`, `pnpm test:e2e`, and
  `pnpm --filter sentinelx-hardhat test` for Solidity.
- **Contracts** – After editing Solidity, run `pnpm lint:check-solidity` inside
  `blockchain/`.
- **Docs Copilot embeddings** – Refresh after updating docs with
  `pnpm docs:ingest` so `/api/ai/ask` has the latest context.
