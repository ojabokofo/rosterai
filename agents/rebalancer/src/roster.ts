import type { PositionSnapshot } from "./pancakeswap.js";
import { config } from "./config.js";

// Best-effort, same pattern as the other two agents — reports a
// liveness/scope count and a substantive result, never moves anything.
export async function reportAggregateStats(snapshots: PositionSnapshot[]) {
  if (!config.rosterAgentId || snapshots.length === 0) return;

  const outOfRange = snapshots.filter((s) => !s.inRange).length;
  const stats = [
    { metric: "POSITIONS WATCHED", value: snapshots.length, unit: null as string | null },
    { metric: "OUT OF RANGE", value: outOfRange, unit: null as string | null },
  ];

  for (const stat of stats) {
    try {
      await fetch(`${config.rosterApiUrl}/agents/${config.rosterAgentId}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stat),
      });
    } catch (err) {
      console.error("Failed to report stats to Roster:", err);
    }
  }
}
