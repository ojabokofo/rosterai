# Yield Optimiser

Read-only agent that compares real Venus Protocol supply APY across markets and recommends the best one. Second real agent in Roster, same safety pattern as `health-factor-monitor`: **no private key, can't sign anything, can't move a single token.**

## What it actually does

Every `POLL_INTERVAL_MS`, reads `supplyRatePerBlock()` off two verified Venus vTokens — vUSDT and vBNB — and annualizes it using Venus's own published formula (0.75s blocks, compounded daily over 365 days — see `src/venus.ts` for the exact math and sources). Logs both, reports the winner back to Roster if `ROSTER_AGENT_ID` is set.

## What it deliberately does NOT do

Move a single token. "Routes liquidity to the highest available APR" — the brief's own description of this category — has two halves: *deciding* where the best yield is, and *actually moving funds there*. This agent does the first half only. The second half needs:

- A wallet with funds to move, and a real decision about whose key that is
- A hard spend cap — never move more than $X per transaction, ever
- A tested path on testnet before mainnet touches real money

None of that got built this session, on purpose. It's a different, higher-stakes kind of work than reading a public rate off a contract, and deserves an explicit answer to "whose key, what's the cap" rather than an assumed one.

## Running it

```bash
cd agents/yield-optimiser
cp .env.example .env
pnpm install
pnpm dev
```

Works with zero configuration beyond `BSC_RPC_URL` — Roster reporting is optional, add `ROSTER_AGENT_ID` once this agent has a real row in Supabase.

## Verification status

vUSDT and vBNB addresses are cross-checked against BscScan directly (both actively used — vUSDT alone has 1.4M+ transactions). The APY formula is Venus's own, from their official protocol-math documentation, not a reconstruction. What's unverified, same as every onchain read in this project: the live call itself, since nothing here can reach a BSC RPC endpoint. Run it and compare the output against the real rates shown on venus.io before trusting it.
