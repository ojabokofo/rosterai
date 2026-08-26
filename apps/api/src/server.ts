import Fastify from "fastify";
import cors from "@fastify/cors";
import { agentRoutes } from "./routes/agents.js";
import { categoryRoutes } from "./routes/categories.js";
import { activationRoutes } from "./routes/activations.js";
import { advantageReportRoutes } from "./routes/advantage-report.js";
import { wellKnownRoutes } from "./routes/well-known.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/health", async () => ({ ok: true, service: "roster-api" }));

await app.register(agentRoutes);
await app.register(categoryRoutes);
await app.register(activationRoutes);
await app.register(advantageReportRoutes);
await app.register(wellKnownRoutes);

const port = Number(process.env.PORT ?? 4000);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
