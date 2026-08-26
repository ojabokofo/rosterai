import type { FastifyInstance } from "fastify";
import type { AgentCard } from "@roster/shared";

// Roster's own Agent Card. Lets other A2A-aware systems discover Roster
// as an orchestrating client rather than a black box.
const rosterCard: AgentCard = {
  name: "Roster",
  description:
    "Discovery and activation marketplace for rebalancing, grid trading, yield optimisation, and health-factor agents on BNB Chain.",
  url: process.env.PUBLIC_API_URL ?? "http://localhost:4000",
  version: "0.1.0",
  preferredTransport: "HTTP+JSON",
  capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
  skills: [
    {
      id: "discover-agents",
      name: "Discover agents",
      description: "List and filter agents by category, live stats, and status.",
      tags: ["discovery", "defi", "bnb-chain"],
    },
  ],
};

export async function wellKnownRoutes(app: FastifyInstance) {
  app.get("/.well-known/agent-card.json", async () => rosterCard);
}
