export const config = {
  // Supply rates move slowly — no need to poll as tight as a liquidation
  // watcher. 5 minutes by default.
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 300_000),
  rosterApiUrl: process.env.ROSTER_API_URL ?? "http://localhost:4000",
  rosterAgentId: process.env.ROSTER_AGENT_ID || null,
};
