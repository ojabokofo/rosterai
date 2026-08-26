import { getAllMarketApys } from "./venus.js";
import { reportBestMarket } from "./roster.js";
import { config } from "./config.js";

// Yield Optimisation agent — read-only, recommendation only. Compares
// real Venus Protocol supply APY across markets and logs the best one.
// Does not move funds: routing capital to the winner needs a signing
// key and a spend cap this session deliberately doesn't build — see
// README.md.

async function tick() {
  const markets = await getAllMarketApys();
  const best = markets.reduce((a, b) => (b.supplyApyPercent > a.supplyApyPercent ? b : a));

  console.log(`[${new Date().toISOString()}] Compared ${markets.length} Venus markets:`);
  for (const m of markets) {
    const marker = m.symbol === best.symbol ? "→" : " ";
    console.log(`  ${marker} ${m.symbol.padEnd(6)} ${m.supplyApyPercent.toFixed(2)}% supply APY`);
  }

  await reportBestMarket(markets);
}

console.log(`Yield Optimiser starting — comparing every ${config.pollIntervalMs / 1000}s`);
tick();
setInterval(tick, config.pollIntervalMs);
