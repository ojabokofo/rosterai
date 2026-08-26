import type { AccountSnapshot } from "./venus.js";
import { config } from "./config.js";

export async function sendAlert(snapshot: AccountSnapshot) {
  const line = `[${snapshot.fetchedAt}] ${snapshot.address} — ${snapshot.status.toUpperCase()} — liquidity $${snapshot.liquidityUsd.toFixed(2)}, shortfall $${snapshot.shortfallUsd.toFixed(2)}`;

  if (snapshot.status === "healthy") {
    console.log(line);
    return;
  }

  console.warn(line);

  if (config.alertWebhookUrl) {
    try {
      await fetch(config.alertWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
    } catch (err) {
      console.error("Alert webhook failed:", err);
    }
  }
}
