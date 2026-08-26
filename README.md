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

**Session 3 — manage what you've activated.**
- `apps/web/app/my-agents`: connect a wallet, see everything that wallet has activated (`GET /activations?wallet=`), revoke any of it (`POST /activations/:id/revoke`) with the row updating inline. No new backend routes needed — Session 1 already shipped them, this session just built the screen that calls them.
- Fixed `apps/api/src/routes/activations.ts` to map Supabase's raw snake_case columns onto the shared camelCase `Activation` type before returning, instead of leaking DB column names to the frontend.
- This is the one screen in the app that only means something once Supabase is actually configured — activate something, then check My Agents, and if it shows up your database round-trip works end to end.

**Session 4 — real PancakeSwap data, read directly from the chain.**
- `apps/api/src/chain/pancakeswap.ts`: calls PancakeSwap's own V3 Factory on BSC mainnet (`getPool`), then reads `slot0`/`liquidity` off the resulting pool contract. No third-party indexer, no API key. Ships with one verified pair (CAKE/WBNB, 0.25% tier) — see the file for how to add more, and why addresses are worth double-checking yourself before adding them.
- New `GET /pancakeswap/pools` route, 30s in-memory cache so the discovery page doesn't hammer the public RPC on every load.
- `PancakeSwapTicker` on the discovery page shows it live, linked out to BscScan — and renders nothing at all if the read fails, rather than showing something fake.
- **Important, read before relying on this:** the Factory address and the WBNB/CAKE token addresses are cross-checked against PancakeSwap's own developer docs and BscScan, but I have no network path from this sandbox to BSC's RPC — none of this has actually been executed against a live node. Run `apps/api` and hit `/pancakeswap/pools` yourself before trusting it in a demo.
- Deliberately decoupled from `CHAIN_ENV`: this always reads mainnet, regardless of what the agent-wallet checks in `client.ts` are pointed at, because testnet PancakeSwap liquidity wouldn't be real data worth showing.

Not yet built: the Advantage Report tasks themselves, and swapping `apps/web` off mock data onto real `GET /agents` once agents are seeded in Supabase.
