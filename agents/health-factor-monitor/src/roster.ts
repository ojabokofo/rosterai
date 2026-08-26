import type { Address } from "viem";
import type { Activation } from "@roster/shared";
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
