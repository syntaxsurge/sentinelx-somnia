# SentinelX Demo Video Script — 4 Minutes

End-to-end walkthrough for the Somnia Infra + AI Agents track. Open with the problem (backed by research), then show how SentinelX solves it across the data, AI, and control planes.

## 0) Cold open — Problem & Research (0:00 – 0:20)

1. **Visual**: Homepage hero + problem cards. Overlay key stats.
2. **Voiceover**
   - “On-chain price feeds don’t stream continuously—they refresh when deviation thresholds or heartbeat timers fire. Chainlink documents this explicitly for data feeds.”  
   - “On Somnia, DIA recommends 0.5% deviation, 120-second freshness, and a 24-hour heartbeat. Combining feeds without guardrails creates drift and stale reads.”  
   - “Add MEV and historic oracle manipulation incidents and you get a reliability gap. SentinelX closes it with AI-assisted guardrails for Somnia.”
3. **On-screen citations**
   - `docs.chain.link/data-feeds`
   - `docs.somnia.network/.../dia-price-feeds`
   - `docs.flashbots.net/flashbots-auction/overview`

## 1) SentinelX architecture snapshot (0:20 – 0:35)

- **Visual**: Homepage “Solution” row or architecture diagram.
- **Voiceover**: “SentinelX runs a multi-source data plane, AI triage plane, and human-in-the-loop control plane. Let’s see it working on Somnia Shannon with production addresses.”

## 2) Dashboard — Data plane (0:35 – 1:05)

1. Navigate to `/dashboard`.
2. Highlight KPI cards, Monitors table, Daily brief, Action queue.
3. Click **Run policy evaluation**.
   - Show toast + updated Daily brief (new incident with severity badge).
4. **Voiceover**: “The policy runner hits `/api/indexer/run`, evaluates SafeOracleRouter across feeds, and logs telemetry + incidents into Convex.”

## 3) Register a monitor — Configuration (1:05 – 1:35)

1. Go to `/monitors/new`.
2. Use **Seed demo values**, tweak if desired (name, contract, deviation BPS, heartbeat seconds).
3. Submit and show the new row on `/monitors` with “Last evaluation” timestamp.
4. **Voiceover**: “Guarded contract + GuardianHub + SafeOracleRouter are canonical. You only set your policy window and chain configuration is read-only.”

## 4) Simulate incident — Trigger (1:35 – 1:55)

1. Back to `/dashboard`, click **Simulate incident**.
2. Display toast with evaluation summary (processed/anomalies).
3. Refresh Daily brief and Action queue; incident + action intent appear.
4. **Voiceover**: “Demo mode spikes the DemoOracle or flags a Convex fallback, then re-runs the policy so you can demo without waiting on market swings.”

## 5) Review incident — AI plane (1:55 – 2:30)

1. Open `/incidents`, click the latest incident.
2. Highlight AI Summary (severity, root cause, mitigations), telemetry snapshot, advisory tags.
3. Click **Generate new plan** if needed to show deterministic fallback or OpenAI output.
4. **Voiceover**: “LLM summaries translate telemetry into human-readable incidents. Action intents include GuardianHub calldata for pausing or parameter updates.”

## 6) Approve & execute — Control plane (2:30 – 3:10)

1. Navigate to `/actions`.
2. Approve the proposed action.
3. Click **Execute**; confirm the wallet transaction. Show toast when SentinelX records the tx hash automatically.
4. **Voiceover**: “Operators stay in control. Execute calls via wallet, AgentInbox relays only allowlisted calldata, and SentinelX records the hash for auditability.”

## 7) Docs & automation — Production readiness (3:10 – 3:40)

1. Visit `/docs`.
2. Highlight **Demo quickstart**, cron snippet for `POST /api/indexer/run`, API key management, and webhook samples.
3. Open the Docs Copilot section and run a quick question (“How do I schedule the indexer on Vercel?”) to show grounded answers.
4. **Voiceover**: “SentinelX ships ready-to-use docs—cron jobs, webhooks, REST endpoints, and an embedded copilot for ops teams.”

## 8) Close — Call to action (3:40 – 4:00)

- **Voiceover**: “With SentinelX your Somnia agents run in a production-grade loop: multi-source telemetry, AI triage, and guardian-approved execution. Open the dashboard or follow the docs to drop it into your own dApp.”
- **Visual**: Return to homepage hero with CTAs.

---

## Citations

1. Chainlink Data Feeds — deviation thresholds & heartbeat model: https://docs.chain.link/data-feeds  
2. DIA Price Feeds on Somnia — recommended deviation and refresh cadence: https://docs.somnia.network/developer/building-dapps/oracles/dia-price-feeds  
3. Flashbots — MEV research and mitigation strategies: https://docs.flashbots.net/flashbots-auction/overview  
