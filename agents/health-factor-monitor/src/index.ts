import { getAccountSnapshot } from "./venus.js";
import { getWalletsFromRoster } from "./roster.js";
import { sendAlert } from "./alert.js";
import { config } from "./config.js";

// Health Factor Monitoring agent — read-only. It never signs a
// transaction and never needs a private key: it watches Venus Protocol
// account liquidity for a set of wallets and alerts when one is at risk
// of liquidation. Taking defensive action (repaying debt, adding
// collateral) is a deliberately separate, later step — see README.md.

async function tick() {
  const rosterWallets = await getWalletsFromRoster();
  const wallets = rosterWallets.length > 0 ? rosterWallets : config.monitoredWallets;

  if (wallets.length === 0) {
    console.log("No wallets to monitor — set MONITORED_WALLETS or ROSTER_AGENT_ID in .env");
    return;
  }

  for (const wallet of wallets) {
    try {
      const snapshot = await getAccountSnapshot(wallet);
      await sendAlert(snapshot);
    } catch (err) {
      console.error(`Failed to read account liquidity for ${wallet}:`, err);
    }
  }
}

console.log(`Health Factor Monitor starting — polling every ${config.pollIntervalMs / 1000}s`);
tick();
setInterval(tick, config.pollIntervalMs);
