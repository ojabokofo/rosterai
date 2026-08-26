# Roster

Agent marketplace for BNB Chain — discover, compare, and activate rebalancing, grid trading, yield optimisation, and health-factor agents, with equal depth across all four categories.

Targeting: **Main track**, **TermiX Challenge**, **PancakeSwap Challenge**.

Design: [Figma — Roster](https://www.figma.com/design/IdXM1oyefOs6uczpQuZ7Xk)

## Stack

- **Monorepo:** pnpm workspaces (`apps/*`, `packages/*`)
- **apps/web:** Next.js 14 (App Router) + Tailwind, tokens matched to the Figma file
- **apps/api:** Fastify + TypeScript, `@supabase/supabase-js`, `viem` for BSC reads
- **Database:** Supabase (Postgres) — schema in `supabase/migrations/0001_init.sql`
- **packages/shared:** types + the four fixed categories, shared by both apps

## Architecture notes

- **A2A vs. hiring/payment.** Roster acts as an A2A *client* (`apps/api/src/a2a`): it can fetch an agent's own Agent Card (`/.well-known/agent-card.json`, per the [A2A spec](https://a2a-protocol.org)) and will later dispatch tasks to it. A2A doesn't cover payment — since TermiX actually hires (and presumably pays) through the marketplace, `activations` leaves room for a settlement decision later (direct transfer, x402, or otherwise) without being blocked on the Altana track, which this build isn't pursuing.
- **No onchain session/permission layer.** Skipping the Altana track means skipping Keystore-registered sessions — `activations` is an off-chain record of "this wallet activated this agent," not an onchain grant. Revoke is a status flip, not a transaction.
- **Chain reads are read-only for now** (`apps/api/src/chain/client.ts`) — used to confirm an agent's wallet is actually live on BSC (main-track eligibility), not to submit transactions on anyone's behalf yet.
- **Advantage Report** (`advantage_report_tasks` table + `GET /advantage-report`) exists from Session 1 on purpose — TermiX's 30%-weighted "Proven agent advantage" criterion needs at least 3 real with/without comparisons, one from trading/stock/security, so the place to log them should exist before the deadline crunch, not get bolted on later.

## Running locally

```bash
pnpm install
cp .env.example .env    # fill in Supabase + RPC values
pnpm dev:api             # Fastify on :4000
pnpm dev:web              # Next.js on :3000
```

Apply the schema: paste `supabase/migrations/0001_init.sql` into your Supabase project's SQL editor (or `supabase db push` if you're using the CLI).

## Status

**Session 1 — core infrastructure and architecture.** Monorepo, schema, API routes, and the discovery page are wired up; `apps/web` currently reads from `lib/mock-agents.ts` (four sample agents mirroring the Figma cards exactly) until real agent data is seeded and the page is pointed at `GET /agents` instead.

Not yet built: agent detail/activate page, TermiX-facing hire view, revoke UI, the Advantage Report tasks themselves, PancakeSwap-specific benefit logic.
