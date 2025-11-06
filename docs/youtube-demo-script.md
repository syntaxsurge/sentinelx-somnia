# SentinelX Demo Video Script — 4 Minutes

End-to-end walkthrough for the Somnia Infra + AI Agents track. Open with the problem (backed by research), then show how SentinelX solves it across the data, AI, and control planes.

## 1) SentinelX architecture snapshot (0:20 – 0:35)

- **Visual**: Homepage “Solution” row or architecture diagram.
- **Voiceover**: “DeFi responders still chase fragmented oracle alerts and manual approvals. SentinelX unifies a multi-source data plane, AI triage plane, and human-in-the-loop control plane, so let’s see it running on Somnia Shannon with production addresses.”

## 2) Dashboard — Data plane (0:35 – 1:05)

1. Connect wallet with RainbowKit and approve the SIWE prompt.
2. If prompted, create a workspace on `/onboarding` (name + owner wallet), then continue.
3. **Voiceover**: “I first connect my Somnia wallet and create a workspace if needed.”

## 3) Register a monitor — Configuration (1:05 – 1:35)

1. Go to `/monitors/new`.
2. Use **Seed demo values**, tweak if desired (name, contract, deviation BPS, heartbeat seconds).
3. Submit and show the new row on `/monitors` with “Last evaluation” timestamp.
4. **Voiceover**: “In the new monitor wizard I click **Seed demo values**, adjust the form, then submit so the registry picks up the guardable with canonical GuardianHub and SafeOracleRouter defaults; you only set your policy window while chain configuration stays read-only. Somnia-first defaults ship pre-filled.”

## 4) Simulate incident — Trigger (1:35 – 1:55)

1. Back to `/dashboard`, click **Simulate incident**.
2. Display toast with evaluation summary (processed/anomalies).
3. Refresh Daily brief and Action queue; incident + action intent appear.
4. **Voiceover**: “Back on the dashboard I click **Simulate incident**, which spikes the DemoOracle or flags a fallback, then re-runs the policy so you can demo without waiting on market swings.”

## 5) Review incident — AI plane (1:55 – 2:30)

1. Open `/incidents`, click the latest incident.
2. Highlight AI Summary (severity, root cause, mitigations), telemetry snapshot, advisory tags.
3. Click **Generate new plan** if needed to show deterministic fallback or OpenAI output.
4. **Voiceover**: “Inside the incident detail I click **Generate new plan** to surface OpenAI output—LLM summaries translate telemetry into human-readable incidents, and action intents include GuardianHub calldata for pausing or parameter updates.”

## 6) Approve & execute — Control plane (2:30 – 3:10)

1. Navigate to `/actions`.
2. Approve the proposed action.
3. Click **Execute**; confirm the wallet transaction. Show toast when SentinelX records the tx hash automatically.
4. **Voiceover**: “In the Actions console I click **Approve** then **Execute**, and SentinelX records the transaction hash automatically while AgentInbox relays only allowlisted calldata so operators stay in control.”

## 7) Docs & automation — Production readiness (3:10 – 3:40)

1. Visit `/docs`.
2. Highlight **Demo quickstart**, cron snippet for `POST /api/indexer/run`, API key management, and webhook samples.
3. Open the Docs Copilot section and run a quick question (“How do I schedule the indexer on Vercel?”) to show grounded answers.
4. **Voiceover**: “I open the Docs Copilot, ask ‘What payload do I send to create a monitor?’, and SentinelX ships ready-to-use docs.”

## 8) Close — Call to action (3:40 – 4:00)

- **Voiceover**: “With SentinelX your Somnia agents run in a production-grade loop: multi-source telemetry, AI triage, and guardian-approved execution. Open the dashboard or follow the docs to drop it into your own dApp.”
- **Visual**: Return to homepage hero with CTAs.

---

## Citations

1. Chainlink Data Feeds — deviation thresholds & heartbeat model: https://docs.chain.link/data-feeds  
2. DIA Price Feeds on Somnia — recommended deviation and refresh cadence: https://docs.somnia.network/developer/building-dapps/oracles/dia-price-feeds  
3. Flashbots — MEV research and mitigation strategies: https://docs.flashbots.net/flashbots-auction/overview  
