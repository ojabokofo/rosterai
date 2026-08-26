import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { supabase } from "../services/supabase.js";

const createBody = z.object({
  agentId: z.string().uuid(),
  userWallet: z.string(),
});

export async function activationRoutes(app: FastifyInstance) {
  // "Activate" an agent for a user. No onchain session/permission system
  // yet (that's the Altana track's job, which this build isn't pursuing)
  // — this records intent-to-hire so it can back the TermiX Advantage
  // Report and, later, the manage/revoke screen from the Figma file.
  app.post("/activations", async (req, reply) => {
    const body = createBody.parse(req.body);
    const { data, error } = await supabase
      .from("activations")
      .insert({ agent_id: body.agentId, user_wallet: body.userWallet, status: "active" })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return reply.status(201).send(data);
  });

  app.get("/activations", async (req, reply) => {
    const wallet = (req.query as { wallet?: string }).wallet;
    let query = supabase.from("activations").select("*");
    if (wallet) query = query.eq("user_wallet", wallet);
    const { data, error } = await query.order("activated_at", { ascending: false });
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  app.post<{ Params: { id: string } }>("/activations/:id/revoke", async (req, reply) => {
    const { data, error } = await supabase
      .from("activations")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });
}
