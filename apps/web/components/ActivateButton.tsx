"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";

export function ActivateButton({ agentId, accentClass }: { agentId: string; accentClass: string }) {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleActivate() {
    if (!isConnected) {
      const injectedConnector = connectors[0];
      if (injectedConnector) connect({ connector: injectedConnector });
      return;
    }
    setState("loading");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${base}/activations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, userWallet: address }),
      });
      if (!res.ok) throw new Error("activation failed");
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <button
      onClick={handleActivate}
      disabled={state === "loading" || state === "done"}
      className={`w-full rounded py-3 font-data text-sm uppercase tracking-[0.1em] text-ink transition-opacity ${accentClass} disabled:opacity-70`}
    >
      {state === "idle" && (isConnected ? "Activate" : "Connect wallet to activate")}
      {state === "loading" && "Activating…"}
      {state === "done" && "Activated ✓"}
      {state === "error" && "Failed — try again"}
    </button>
  );
}
