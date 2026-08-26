import type { FastifyInstance } from "fastify";
import { CATEGORIES } from "@roster/shared";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/categories", async () => CATEGORIES);
}
