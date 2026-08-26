import type { FastifyInstance } from "fastify";
import { supabase } from "../services/supabase.js";

// Backs the TermiX-required Agent Advantage Report: at least 3 real
// tasks run both with and without an agent from Roster, time/cost/
// quality compared, at least one from trading/stock/security. This
// endpoint just serves the recorded comparisons — the tasks themselves
// get run and logged as the roster fills out.
export async function advantageReportRoutes(app: FastifyInstance) {
  app.get("/advantage-report", async (_req, reply) => {
    const { data, error } = await supabase
      .from("advantage_report_tasks")
      .select("*")
      .order("id", { ascending: true });
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });
}
