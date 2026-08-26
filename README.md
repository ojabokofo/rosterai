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

**Session 2 — the discover → understand → activate loop, working end to end.**
- Roster cards on the discovery page are now real links to `/agents/[id]`.
- New agent detail page: full description, every stat (not just the two shown on the card), wallet address linked out to BscScan/testnet BscScan, chain, status.
- Wallet connect (`wagmi`, injected connector only — MetaMask/Rabby-style; no WalletConnect Cloud project ID configured yet, so mobile wallets aren't wired up).
- `ActivateButton` calls the real `POST /activations` on `apps/api` with the connected wallet address and shows connect → activating → activated states inline. This is the first place real data can land in the `activations` table.

That closes the loop the main track's Functionality criterion describes almost verbatim: land, find an agent by category, understand what it does, activate it.

Not yet built: a "my agents" / revoke screen (the `POST /activations/:id/revoke` route already exists, no UI calls it yet), the Advantage Report tasks themselves (the table and route exist, no rows in it), PancakeSwap-specific benefit logic, and swapping `apps/web` off mock data onto real `GET /agents` once agents are seeded in Supabase.
