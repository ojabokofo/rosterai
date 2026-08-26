import type { CategorySlug } from "./categories";

export interface Agent {
  id: string;
  callsign: string; // display name, e.g. "RANGE-7"
  category: CategorySlug;
  description: string;
  walletAddress: string; // the agent's own onchain address
  chain: "bsc" | "bsc-testnet";
  status: "live" | "paused" | "retired";
  a2aCardUrl: string | null; // where this agent's own A2A Agent Card is hosted, if any
  createdAt: string;
}

export interface AgentStat {
  agentId: string;
  metric: string; // e.g. "APY", "WIN RATE", "UPTIME", "MIN HF"
  value: number;
  unit: string | null; // "%", "$M", null for raw numbers
  recordedAt: string;
}

export interface Activation {
  id: string;
  agentId: string;
  userWallet: string;
  status: "pending" | "active" | "revoked";
  activatedAt: string;
  revokedAt: string | null;
}

export interface AdvantageTask {
  id: string;
  title: string;
  category: CategorySlug | "trading" | "stock" | "security";
  agentId: string | null;
  withAgentTimeSeconds: number | null;
  withoutAgentTimeSeconds: number | null;
  withAgentCostUsd: number | null;
  withoutAgentCostUsd: number | null;
  withAgentOutputUrl: string | null;
  withoutAgentOutputUrl: string | null;
  qualityNotes: string | null;
}
