import { getPositionSnapshot } from "./pancakeswap.js";
import { reportAggregateStats } from "./roster.js";
import { config } from "./config.js";
import type { PositionSnapshot } from "./pancakeswap.js";

// Rebalancing agent — read-only. Watches PancakeSwap V3 LP positions by
// token ID and flags when the pool's price has moved outside the
// position's range (meaning it's stopped earning fees and gone
// single-sided). Does not rebalance anything itself — see README.md for
// why, and what that would actually take.

async function tick() {
  if (config.monitoredPositionIds.length === 0) {
    console.log("No positions to monitor — set MONITORED_POSITION_IDS in .env (comma-separated NFT token IDs)");
    return;
  }

  const snapshots: PositionSnapshot[] = [];
  for (const tokenId of config.monitoredPositionIds) {
    try {
      const snapshot = await getPositionSnapshot(tokenId);
      const status = snapshot.inRange ? "IN RANGE" : "OUT OF RANGE — not earning fees";
      console.log(
        `[${snapshot.fetchedAt}] #${tokenId} — ${status} (tick ${snapshot.currentTick}, range [${snapshot.tickLower}, ${snapshot.tickUpper}])`
      );
      snapshots.push(snapshot);
    } catch (err) {
      console.error(`Failed to read position #${tokenId}:`, err);
    }
  }

  await reportAggregateStats(snapshots);
}

console.log(`Rebalancer starting — checking every ${config.pollIntervalMs / 1000}s`);
tick();
setInterval(tick, config.pollIntervalMs);
