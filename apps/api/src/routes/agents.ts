import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { supabase } from "../services/supabase.js";

const listQuery = z.object({ category: z.string().optional() });
const AGENT_SELECT =
  "id, callsign, category, description, wallet_address, chain, status, a2a_card_url, created_at, agent_stats(metric, value, unit, recorded_at)";

export async function agentRoutes(app: FastifyInstance) {
  app.get("/agents", async (req, reply) => {
    const { category } = listQuery.parse(req.query);
    let query = supabase.from("agents").select(AGENT_SELECT);
    if (category) query = query.eq("category", category);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.get<{ Params: { id: string } }>("/agents/:id", async (req, reply) => {
    const { data, error } = await supabase
      .from("agents")
      .select(AGENT_SELECT)
      .eq("id", req.params.id)
      .single();

    if (error) return reply.status(404).send({ error: "Agent not found" });
    return data;
  });
}
