import type { Address } from "viem";
import type { Activation } from "@roster/shared";
import type { AccountSnapshot } from "./venus.js";
import { config } from "./config.js";

// Best-effort only: if Roster isn't reachable or ROSTER_AGENT_ID isn't
// set, this returns an empty list and the agent falls back to
// MONITORED_WALLETS from config. Never throws.
export async function getWalletsFromRoster(): Promise<Address[]> {
  if (!config.rosterAgentId) return [];
  try {
    const res = await fetch(`${config.rosterApiUrl}/activations?agentId=${config.rosterAgentId}`);
    if (!res.ok) return [];
    const activations: Activation[] = await res.json();
    return activations.filter((a) => a.status === "active").map((a) => a.userWallet as Address);
  } catch {
    return [];
  }
}

// Reports what this tick actually found back into Roster's agent_stats,
// so GUARD-2's card shows this agent's real numbers instead of nothing.
// WALLETS WATCHED is a simple liveness signal; LOWEST BUFFER is
// liquidity-minus-shortfall across every watched wallet, so it goes
// negative the moment any one of them is underwater — the single number
// most worth surfacing on a card. Best-effort: monitoring and alerting
// already happened locally regardless of whether this succeeds.
export async function reportAggregateStats(snapshots: AccountSnapshot[]) {
  if (!config.rosterAgentId || snapshots.length === 0) return;

  const lowestBuffer = Math.min(...snapshots.map((s) => s.liquidityUsd - s.shortfallUsd));
  const stats = [
    { metric: "WALLETS WATCHED", value: snapshots.length, unit: null as string | null },
    { metric: "LOWEST BUFFER", value: Number(lowestBuffer.toFixed(2)), unit: "$" },
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
