export const config = {
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 60_000),
  rosterApiUrl: process.env.ROSTER_API_URL ?? "http://localhost:4000",
  rosterAgentId: process.env.ROSTER_AGENT_ID || null,
  monitoredPositionIds: (process.env.MONITORED_POSITION_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => BigInt(s)),
};
