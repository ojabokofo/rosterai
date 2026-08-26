"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Field names are a best-effort mapping — 8004scan's response schema
// wasn't fully visible when this was written, only the endpoint
// descriptions (which did confirm total_score, quality_score, and the
// ERC-8004 spec's own name/description/endpoints fields). Coded
// defensively with fallbacks; the raw response wins if these guesses
// are wrong. See apps/api/src/services/scan8004.ts.
interface ScanAgent {
  token_id?: string | number;
  chain_id?: number;
  name?: string;
  agent_name?: string;
  description?: string;
  total_score?: number;
  quality_score?: number;
  [key: string]: unknown;
}

export default function ExplorePage() {
  const [agents, setAgents] = useState<ScanAgent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const url = new URL(`${base}/explore/agents`);
    if (query) url.searchParams.set("search", query);

    setError(null);
    const timeout = setTimeout(() => {
      fetch(url.toString())
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => setAgents(data.agents ?? data.items ?? data.results ?? data))
        .catch(() => setError("Couldn't reach 8004scan — check apps/api is running and try again."));
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <main className="mx-auto max-w-[1440px] px-24 py-16">
      <Link
        href="/"
        className="font-data text-[11px] uppercase tracking-[0.1em] text-paper-muted hover:text-paper"
      >
        ← Curated roster
      </Link>

      <h1 className="mt-4 font-display text-4xl font-bold text-paper">Every agent live on BSC</h1>
      <p className="mt-3 max-w-[640px] font-body text-base text-paper-muted">
        Real ERC-8004 registrations, sourced live from 8004scan — not Roster&apos;s curated four
        categories, the whole registry.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, address, or token ID…"
        className="mt-8 w-full max-w-[480px] rounded border border-paper-muted bg-ink-elevated px-4 py-2.5 font-body text-sm text-paper placeholder:text-paper-muted focus:border-brass focus:outline-none"
      />

      {error && <p className="mt-10 font-body text-coral">{error}</p>}
      {!error && agents === null && <p className="mt-10 font-body text-paper-muted">Loading…</p>}
      {agents && agents.length === 0 && <p className="mt-10 font-body text-paper-muted">No matches.</p>}

      <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
        {agents?.map((agent, i) => {
          const name = agent.name ?? agent.agent_name ?? `Agent #${agent.token_id ?? i}`;
          const score = agent.total_score ?? agent.quality_score;
          return (
            <a
              key={String(agent.token_id ?? i)}
              href={`https://8004scan.io/agents/${agent.chain_id ?? 56}/${agent.token_id}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-3 rounded-lg bg-ink-elevated p-5 transition-transform hover:-translate-y-0.5"
            >
              <h3 className="font-display text-base font-bold text-paper">{String(name)}</h3>
              {agent.description && (
                <p className="line-clamp-2 font-body text-sm text-paper-muted">{String(agent.description)}</p>
              )}
              {score !== undefined && score !== null && (
                <div className="flex items-center gap-2">
                  <span className="font-data text-[11px] tracking-[0.1em] text-paper-muted">SCORE</span>
                  <span className="font-data text-sm font-semibold text-brass">{Number(score).toFixed(0)}</span>
                </div>
              )}
            </a>
          );
        })}
      </div>
    </main>
  );
}
