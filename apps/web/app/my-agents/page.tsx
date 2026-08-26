"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import type { Activation } from "@roster/shared";
import { mockAgents } from "@/lib/mock-agents";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

const ACCENT_BG: Record<string, string> = {
  rebalancing: "bg-brass",
  "grid-trading": "bg-teal",
  "yield-optimisation": "bg-moss",
  "health-factor": "bg-coral",
};

type Row = Activation & { revoking?: boolean };

export default function MyAgentsPage() {
  const { address, isConnected } = useAccount();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setRows(null);
      return;
    }
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    setError(null);
    setRows(null);
    fetch(`${base}/activations?wallet=${address}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data: Activation[]) => setRows(data))
      .catch(() =>
        setError(
          "Couldn't load activations — check that apps/api is running and Supabase is configured (see README)."
        )
      );
  }, [address, isConnected]);

  async function revoke(id: string) {
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, revoking: true } : r)) ?? prev);
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${base}/activations/${id}/revoke`, { method: "POST" });
      if (!res.ok) throw new Error();
      setRows(
        (prev) =>
          prev?.map((r) => (r.id === id ? { ...r, status: "revoked", revoking: false } : r)) ?? prev
      );
    } catch {
      setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, revoking: false } : r)) ?? prev);
      setError("Revoke failed — try again.");
    }
  }

  return (
    <main className="mx-auto max-w-[860px] px-8 py-16">
      <div className="flex items-start justify-between gap-8">
        <div>
          <Link
            href="/"
            className="font-data text-[11px] uppercase tracking-[0.1em] text-paper-muted hover:text-paper"
          >
            ← Discover agents
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold text-paper">My Agents</h1>
        </div>
        <ConnectWalletButton />
      </div>

      {!isConnected && (
        <p className="mt-10 font-body text-paper-muted">Connect a wallet to see what you've activated.</p>
      )}

      {isConnected && rows === null && !error && (
        <p className="mt-10 font-body text-paper-muted">Loading…</p>
      )}

      {error && <p className="mt-10 font-body text-coral">{error}</p>}

      {isConnected && rows !== null && rows.length === 0 && (
        <p className="mt-10 font-body text-paper-muted">
          Nothing activated yet.{" "}
          <Link href="/" className="text-brass underline underline-offset-4">
            Browse the roster
          </Link>
          .
        </p>
      )}

      <div className="mt-10 flex flex-col gap-3">
        {rows?.map((row) => {
          const agent = mockAgents.find((a) => a.id === row.agentId);
          if (!agent) return null;
          const accent = ACCENT_BG[agent.category];
          const revoked = row.status === "revoked";
          return (
            <div key={row.id} className="flex items-center justify-between rounded-lg bg-ink-elevated p-4">
              <div className="flex items-center gap-4">
                <div className={`h-2 w-2 rounded-full ${revoked ? "bg-paper-muted" : accent}`} />
                <div>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="font-display text-base font-bold text-paper hover:text-brass"
                  >
                    {agent.callsign}
                  </Link>
                  <p className="font-data text-[11px] tracking-[0.1em] text-paper-muted">
                    {revoked ? "REVOKED" : "ACTIVE"} · SINCE {new Date(row.activatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {!revoked && (
                <button
                  onClick={() => revoke(row.id)}
                  disabled={row.revoking}
                  className="rounded border border-coral px-3 py-1.5 font-data text-[11px] uppercase tracking-[0.1em] text-coral hover:bg-coral hover:text-ink disabled:opacity-50"
                >
                  {row.revoking ? "Revoking…" : "Revoke"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
