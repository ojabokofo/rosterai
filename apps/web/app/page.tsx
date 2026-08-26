"use client";

import { useState } from "react";
import { CATEGORIES } from "@roster/shared";
import { mockAgents } from "@/lib/mock-agents";
import { RosterCard } from "@/components/RosterCard";
import { CategoryPill } from "@/components/CategoryPill";

export default function DiscoveryPage() {
  const [active, setActive] = useState<string | null>(null);
  const agents = active ? mockAgents.filter((a) => a.category === active) : mockAgents;

  return (
    <main className="mx-auto max-w-[1440px] px-24 py-16">
      <section className="flex max-w-[640px] flex-col gap-4">
        <span className="font-data text-[11px] tracking-[0.1em] text-brass">
          AGENT ROSTER — BNB CHAIN
        </span>
        <h1 className="font-display text-5xl font-semibold leading-tight text-paper">
          Hire a specialist, not a dashboard.
        </h1>
        <p className="font-body text-base text-paper-muted">
          Every rebalancer, grid trader, yield router, and health monitor live on BSC — real
          stats, one activation away.
        </p>
      </section>

      <nav className="mt-12 flex gap-3">
        {CATEGORIES.map((c) => (
          <CategoryPill
            key={c.slug}
            slug={c.slug}
            active={active === c.slug || active === null}
            onClick={() => setActive(active === c.slug ? null : c.slug)}
          />
        ))}
      </nav>

      <section className="mt-8 flex flex-wrap gap-5">
        {agents.map((agent) => (
          <RosterCard key={agent.id} agent={agent} />
        ))}
      </section>
    </main>
  );
}
