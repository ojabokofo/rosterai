# Health Factor Monitor

Read-only agent that watches Venus Protocol lending positions on BSC and alerts before liquidation. Roster's first real agent — everything before this was the marketplace listing and activating *hypothetical* agents.

## What it actually does

Every `POLL_INTERVAL_MS`, for each wallet it's watching, it calls `getAccountLiquidity` on Venus's Core Pool Comptroller (`0xfd36E2c2a6789Db23113685031d7F16329158384`) and classifies the result:

- **at_risk** — `shortfall > 0`. The account is under-collateralized right now and liquidatable.
- **low_buffer** — no shortfall yet, but liquidity is under `LOW_BUFFER_USD`.
- **healthy** — everything else.

That's it. It logs, and optionally `POST`s to `ALERT_WEBHOOK_URL`. **It never signs a transaction and never needs a private key** — this is deliberately the safest possible version of a health-factor agent, because transaction-sending code is exactly the kind of thing that deserves more than "trust me" before it touches real funds, and this was built somewhere with no way to test against a live chain (see Verification below).

## What it does NOT do (yet)

Repaying debt or topping up collateral automatically — the part of "Health Factor Monitoring" that actually *prevents* liquidation rather than just reports it — needs a signing key, a hard spend cap, and real testnet runs before it's trustworthy. That's a deliberately separate next step, not an oversight.

## Running it

```bash
cd agents/health-factor-monitor
cp .env.example .env      # set at least one wallet, see below
pnpm install
pnpm dev
```

Two ways to tell it what to watch:
- Set `ROSTER_AGENT_ID` to this agent's row id in Roster's `agents` table — it'll ask Roster who has activated it (`GET /activations?agentId=`) and watch those wallets automatically. Falls back silently if Roster isn't running or the id isn't set yet.
- Or just set `MONITORED_WALLETS` directly (comma-separated addresses) and run it fully standalone, no Roster dependency at all.

## Verification status — read this before a demo

The Comptroller address and the `getAccountLiquidity` signature are cross-checked against Venus's own v4 developer docs, a public Code4rena security-audit repo of the Comptroller source, and BscScan (which shows this exact contract holding real funds across hundreds of thousands of transactions, not a stale or abandoned deployment). What hasn't happened: an actual call against it. This was built in a sandbox with no network path to a BSC RPC endpoint, so `pnpm typecheck` and `pnpm build` prove the code is correct TypeScript — they don't prove the onchain read works.

Before this is in front of a judge: run it against a real wallet (your own, mainnet, read-only — there's no risk in just watching an address) and confirm the numbers it reports match what you see on venus.io for that account.
