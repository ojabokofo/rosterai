import type { MarketApy } from "./venus.js";
import { config } from "./config.js";

// Best-effort, recommendation only — never moves anything, just reports
// the current winner onto this agent's Roster card. Console output
// already happened regardless of whether this succeeds.
export async function reportBestMarket(markets: MarketApy[]) {
  if (!config.rosterAgentId || markets.length === 0) return;

  const best = markets.reduce((a, b) => (b.supplyApyPercent > a.supplyApyPercent ? b : a));
  const stats = [
    { metric: "MARKETS COMPARED", value: markets.length, unit: null as string | null },
    { metric: `BEST APY (${best.symbol})`, value: Number(best.supplyApyPercent.toFixed(2)), unit: "%" },
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
