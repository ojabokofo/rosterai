# Rebalancer

Read-only agent that watches PancakeSwap V3 LP positions and flags when the pool price has moved outside the position's range — the moment it stops earning fees and goes single-sided. Third real agent in Roster, same rule as the other two: **no private key, can't sign, can't move a token.**

## What it actually does

Every `POLL_INTERVAL_MS`, for each tracked position (by NFT token ID), reads `positions(tokenId)` off PancakeSwap's `NonfungiblePositionManager` to get its range and pool, then reads that pool's current tick via `slot0()` — the exact same pattern as `apps/api/src/chain/pancakeswap.ts` in the marketplace itself. If the current tick falls outside `[tickLower, tickUpper)`, the position is flagged out of range.

## What it deliberately does NOT do

Rebalance anything. Actually fixing an out-of-range position means removing the old liquidity, swapping to the right ratio, and minting a new position centered on the current price — three onchain writes, each costing gas and each a chance to lose money if the logic or the market moves wrong mid-transaction. That needs everything the other two agents' READMEs already said: a real key, a hard spend cap, a tested path on testnet first. Still an open question, not an oversight.

## A gap worth naming: this doesn't plug into Roster's activation flow yet

Health Factor Monitor and Yield Optimiser both fit Roster's current `activations` table cleanly — "this wallet activated this agent" is all either one needs. A rebalancer needs to know *which specific position* (token ID) to watch per user, and `activations` has no field for that. Bolting it on would mean a schema change (`activations` needs a `config jsonb` column or similar), not just new code here — worth deciding properly rather than hacking around it.

## Running it

```bash
cd agents/rebalancer
cp .env.example .env      # add at least one MONITORED_POSITION_IDS
pnpm install
pnpm dev
```

## Verification status

Factory and NonfungiblePositionManager addresses, plus the `positions()` and `slot0()` signatures, are read directly from PancakeSwap's own official developer docs (`developer.pancakeswap.finance/contracts/v3/addresses`) — first-party, not a third-party guess. Same caveat as every onchain read in this project: the live call itself has never executed, no BSC RPC access from this sandbox. Plug in a real position's token ID and confirm the range/tick it reports matches what PancakeSwap's own UI shows before this is in front of a judge.
