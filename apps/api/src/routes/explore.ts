import type { FastifyInstance } from "fastify";
import { listBscAgents, getBscAgent } from "../services/scan8004.js";

// Real agents actually registered on BSC (ERC-8004), sourced live from
// 8004scan — not Roster's own curated four categories, the whole
// registry. This is what answers "can I see everything that's live on
// BSC," which the curated marketplace alone can't.
export async function exploreRoutes(app: FastifyInstance) {
  app.get("/explore/agents", async (req, reply) => {
    const q = req.query as {
      limit?: string;
      offset?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    };
    try {
      return await listBscAgents({
        limit: q.limit ? Number(q.limit) : undefined,
        offset: q.offset ? Number(q.offset) : undefined,
        search: q.search,
        sortBy: q.sortBy,
        sortOrder: q.sortOrder,
      });
    } catch (err) {
      app.log.error(err);
      return reply.status(502).send({ error: "Failed to reach 8004scan" });
    }
  });

  app.get<{ Params: { tokenId: string } }>("/explore/agents/:tokenId", async (req, reply) => {
    try {
      return await getBscAgent(req.params.tokenId);
    } catch (err) {
      app.log.error(err);
      return reply.status(502).send({ error: "Failed to reach 8004scan" });
    }
  });
}
