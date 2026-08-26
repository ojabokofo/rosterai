import type { Agent, AgentStat } from "@roster/shared";

// Placeholder data standing in for `GET /agents` until the API + Supabase
// are wired up and seeded. Mirrors the four cards built in the Figma file
// (https://www.figma.com/design/IdXM1oyefOs6uczpQuZ7Xk) exactly, so the
// coded page and the design stay in sync. Swap the fetch in app/page.tsx
// for a real `GET /agents` call once agents are seeded.
export const mockAgents: (Agent & { stats: AgentStat[] })[] = [
  {
    id: "1",
    callsign: "RANGE-7",
    category: "rebalancing",
    description: "Keeps concentrated LP positions inside range, resets automatically.",
    walletAddress: "0x0000000000000000000000000000000000dEaD",
    chain: "bsc-testnet",
    status: "live",
    a2aCardUrl: null,
    createdAt: new Date().toISOString(),
    stats: [
      { agentId: "1", metric: "APY", value: 18.4, unit: "%", recordedAt: new Date().toISOString() },
      { agentId: "1", metric: "UPTIME", value: 99.2, unit: "%", recordedAt: new Date().toISOString() },
    ],
  },
  {
    id: "2",
    callsign: "GRID-11",
    category: "grid-trading",
    description: "Runs a 12-line grid, resets the range on trend breaks.",
    walletAddress: "0x0000000000000000000000000000000000dEaD",
    chain: "bsc-testnet",
    status: "live",
    a2aCardUrl: null,
    createdAt: new Date().toISOString(),
    stats: [
      { agentId: "2", metric: "WIN RATE", value: 61, unit: "%", recordedAt: new Date().toISOString() },
      { agentId: "2", metric: "TRADES/DAY", value: 42, unit: null, recordedAt: new Date().toISOString() },
    ],
  },
  {
    id: "3",
    callsign: "YIELD-4",
    category: "yield-optimisation",
    description: "Routes idle liquidity across lending and staking for the best net APR.",
    walletAddress: "0x0000000000000000000000000000000000dEaD",
    chain: "bsc-testnet",
    status: "live",
    a2aCardUrl: null,
    createdAt: new Date().toISOString(),
    stats: [
      { agentId: "3", metric: "APY", value: 22.1, unit: "%", recordedAt: new Date().toISOString() },
      { agentId: "3", metric: "TVL ROUTED", value: 1.2, unit: "$M", recordedAt: new Date().toISOString() },
    ],
  },
  {
    id: "4",
    callsign: "GUARD-2",
    category: "health-factor",
    description: "Watches lending positions, alerts or tops up collateral before liquidation.",
    walletAddress: "0x0000000000000000000000000000000000dEaD",
    chain: "bsc-testnet",
    status: "live",
    a2aCardUrl: null,
    createdAt: new Date().toISOString(),
    stats: [
      { agentId: "4", metric: "MIN HF", value: 1.42, unit: null, recordedAt: new Date().toISOString() },
      { agentId: "4", metric: "ALERTS SENT", value: 3, unit: null, recordedAt: new Date().toISOString() },
    ],
  },
];
