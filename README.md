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

## Repo layout

- `apps/web`, `apps/api`, `packages/shared` — the marketplace (Sessions 1–5).
- `agents/` — real, standalone agents that get *listed on* the marketplace. Separate from `apps/` on purpose: these are the things Roster surfaces, not part of Roster itself.

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

**Session 5 — a place to actually show the Advantage Report, not just store it.**
- `apps/web/app/advantage-report`: fetches `GET /advantage-report` and renders each task's with/without time, cost, and output links, plus a checklist against TermiX's own requirements — 3+ tasks logged, at least one from trading/stock/security — so it's obvious at a glance whether the report clears the bar, not just that a table exists.
- Added `POST /advantage-report` (was GET-only) and fixed the same snake_case-vs-camelCase mismatch Session 3 caught in `activations.ts` — same bug, different table, fixed the same way.
- **The real blocker isn't Supabase, it's agents.** The Advantage Report needs a real agent to run a task with vs. without — and nothing built so far *is* an agent; Roster only lists and activates them. Filling this in for real needs an actual rebalancing/grid/yield/health-factor agent deployed (via BNB Agent Studio, per the hackathon's own tooling) before there's anything to compare against a human doing the task manually.

**Session 6 — the first real agent.**
- `agents/health-factor-monitor`: reads live account liquidity off Venus Protocol's Core Pool Comptroller on BSC mainnet and alerts when a wallet is at risk of liquidation. Read-only — no private key, can't sign anything, can't move funds. That's deliberate: it's the safest version of the four categories to build first, and the only one whose MVP is complete without a signing/spend-cap story.
- It can pull its list of wallets to watch straight from Roster (`GET /activations?agentId=`, added this session) or run fully standalone off a `MONITORED_WALLETS` env var — no hard dependency either way.
- **Read `agents/health-factor-monitor/README.md` before demoing this one.** The Comptroller address and ABI are cross-checked against three independent sources, but nothing in this sandbox can reach a BSC RPC endpoint, so the actual onchain call has never run. Confirm it against a real wallet yourself first.
- Explicitly does not attempt repayment or collateral top-ups yet — the fund-moving half of "Health Factor Monitoring" needs a key-management and spend-cap story before it's built, not a rushed one.

**Session 7 — the marketplace showing real numbers from a real agent.**
- Fixed a design gap before it became a bug: `agent_stats` was insert-only, so a live-polling agent would have piled up one row per metric per tick forever with no way to know which was current. `supabase/migrations/0002_agent_stats_latest.sql` adds a unique constraint on `(agent_id, metric)`; `POST /agents/:id/stats` now upserts on it.
- `agents/health-factor-monitor` reports after every tick — `WALLETS WATCHED` (how many positions it's actively polling) and `LOWEST BUFFER` (liquidity minus shortfall across all of them, so it goes negative the moment any one is underwater). Once this agent is seeded into Supabase with a real id in `ROSTER_AGENT_ID`, its card on the discovery page shows these instead of nothing.
- Didn't touch the fund-moving agents this round on purpose — this was the safe, connective piece: real data flowing from an agent that exists into the marketplace that lists it, no new financial logic involved.

**Session 8 — second real agent, same boundary held on purpose.**
- `agents/yield-optimiser`: compares real Venus supply APY across vUSDT and vBNB (Venus's own annualization formula, not a guess) and reports the winner onto its Roster card. Same pattern as the health monitor and the same reason: recommending where yield is best doesn't need a key, *moving funds there* does.
- You asked which of the three fund-moving categories to build and what custody model to use — I didn't answer either, on purpose. This session sidesteps the question rather than guessing at it: it's Yield Optimisation in read-only/recommend mode, which needed neither a category commitment beyond "yield" nor a key. Rebalancing and Grid Trading don't have that option — there's no honest read-only MVP for "place a grid order," so those two are genuinely blocked on you answering whose key and what spend cap, not on effort.

**Session 9 — third real agent, and a schema gap worth naming before it's hacked around.**
- `agents/rebalancer`: watches PancakeSwap V3 LP positions by token ID (`NonfungiblePositionManager.positions()`) and flags when the pool's current tick has moved outside the position's range — same Factory + pool-reading pattern as `apps/api/src/chain/pancakeswap.ts`, both addresses confirmed against PancakeSwap's own official docs. Read-only, same as the other two.
- Unlike the first two agents, this one **doesn't cleanly fit Roster's activation flow** — `activations` only carries `agent_id` + `user_wallet`, with nowhere to record *which position* a given user wants watched. Runs standalone off `MONITORED_POSITION_IDS` for now rather than forcing a bad fit; see the agent's own README for what a real fix (`config jsonb` on `activations`, most likely) would look like.
- Grid Trading is the one category left with no agent at all — and like Rebalancing and Yield's execution half, it has no honest read-only MVP either (a grid bot that doesn't place orders isn't a grid bot).
- The custody question — whose key, what spend cap — is still open. Three agents now stop right at that line on purpose, not by accident.

**Session 10 — the audit's biggest gap, addressed: real agents are now browsable.**
- `/explore` on the web app and `GET /explore/agents` on the API surface real ERC-8004 registrations on BSC mainnet, live from 8004scan's public API (`apps/api/src/services/scan8004.ts`) — not Roster's four curated categories, the actual registry. Anonymous access, no key required to work; `SCAN8004_API_KEY` just raises the rate ceiling once approved.
- This is additive, not a replacement — the curated four-category flow (Sessions 1–9) is still the main journey the brief asks for. `/explore` answers a different, real question: can a user see everything actually live on BSC, not just Roster's own four listings. Per the build audit, before this session the honest answer was no.
- Confirmed via 8004scan's own Developer Hub and published OpenAPI spec, fetched directly — endpoints, params, and the anonymous-tier rate limit are real, not assumed. What's **not** independently re-verified: the exact response JSON field names (the schema definitions were cut off mid-fetch), and BSC's chain_id=56 specifically *in 8004scan's own system* rather than just as the general EVM standard. The frontend is coded defensively around the first; `GET /api/v1/chains` is the fix if the second is wrong and nothing shows up.
- Doesn't touch the eligibility gap around Roster's *own* four agents still being mock data — that's a separate problem this doesn't solve, on purpose, since 200k+ real agents existing elsewhere doesn't make RANGE-7 real.

Left: the mock→Supabase swap for Roster's own four agents, deployment, Advantage Report content, Grid Trading agent, and everything else the audit flagged that this session didn't touch.
