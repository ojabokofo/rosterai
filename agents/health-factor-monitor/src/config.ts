import type { Address } from "viem";

export const config = {
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 60_000),
  rosterApiUrl: process.env.ROSTER_API_URL ?? "http://localhost:4000",
  // This agent's own id in Roster's `agents` table — used to ask "who has
  // activated me?" via GET /activations?agentId=. Leave unset to skip
  // Roster entirely and just watch MONITORED_WALLETS below.
  rosterAgentId: process.env.ROSTER_AGENT_ID || null,
  // Fallback / standalone mode: comma-separated addresses to watch even
  // without Roster running.
  monitoredWallets: (process.env.MONITORED_WALLETS ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean) as Address[],
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL || null,
};
