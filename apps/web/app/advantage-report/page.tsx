"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdvantageTask } from "@roster/shared";

const HIGH_STAKES = ["trading", "stock", "security"];

function fmtTime(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function fmtCost(usd: number | null) {
  return usd === null ? "—" : `$${usd.toFixed(2)}`;
}

export default function AdvantageReportPage() {
  const [tasks, setTasks] = useState<AdvantageTask[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${base}/advantage-report`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setTasks)
      .catch(() => setError(true));
  }, []);

  const total = tasks?.length ?? 0;
  const meetsMinimum = total >= 3;
  const hasHighStakes = tasks?.some((t) => HIGH_STAKES.includes(t.category)) ?? false;

  return (
    <main className="mx-auto max-w-[860px] px-8 py-16">
      <Link
        href="/"
        className="font-data text-[11px] uppercase tracking-[0.1em] text-paper-muted hover:text-paper"
      >
        ← Discover agents
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-paper">Agent Advantage Report</h1>
      <p className="mt-3 max-w-[560px] font-body text-base text-paper-muted">
        Real tasks, run both with and without an agent hired from Roster — what TermiX&apos;s
        &quot;Proven agent advantage&quot; criterion is scored against.
      </p>

      {tasks && (
        <div className="mt-8 flex flex-wrap gap-3">
          <span
            className={`rounded border px-3 py-1.5 font-data text-[11px] uppercase tracking-[0.1em] ${
              meetsMinimum ? "border-moss text-moss" : "border-coral text-coral"
            }`}
          >
            {meetsMinimum ? "✓" : "○"} {total} / 3 minimum tasks
          </span>
          <span
            className={`rounded border px-3 py-1.5 font-data text-[11px] uppercase tracking-[0.1em] ${
              hasHighStakes ? "border-moss text-moss" : "border-coral text-coral"
            }`}
          >
            {hasHighStakes ? "✓" : "○"} trading / stock / security task included
          </span>
        </div>
      )}

      {error && (
        <p className="mt-10 font-body text-coral">Couldn&apos;t load the report — check apps/api is running.</p>
      )}

      {tasks && tasks.length === 0 && !error && (
        <div className="mt-10 rounded-lg bg-ink-elevated p-6 font-body text-paper-muted">
          <p>
            Nothing logged yet. Each task needs an agent run both with and without help, real
            time/cost, and the actual outputs attached — not estimated.
          </p>
          <p className="mt-3">
            Log one with <code className="font-data text-paper">POST /advantage-report</code> once
            you have a real comparison to record.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {tasks?.map((task) => (
          <div key={task.id} className="rounded-lg bg-ink-elevated p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-base font-bold text-paper">{task.title}</h3>
              <span className="shrink-0 font-data text-[11px] uppercase tracking-[0.1em] text-paper-muted">
                {task.category}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 font-data text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] text-brass">With Roster</p>
                <p className="mt-1 text-paper">
                  {fmtTime(task.withAgentTimeSeconds)} · {fmtCost(task.withAgentCostUsd)}
                </p>
                {task.withAgentOutputUrl && (
                  <a
                    href={task.withAgentOutputUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-paper-muted underline underline-offset-4 hover:text-brass"
                  >
                    output
                  </a>
                )}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.1em] text-paper-muted">Without</p>
                <p className="mt-1 text-paper">
                  {fmtTime(task.withoutAgentTimeSeconds)} · {fmtCost(task.withoutAgentCostUsd)}
                </p>
                {task.withoutAgentOutputUrl && (
                  <a
                    href={task.withoutAgentOutputUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-paper-muted underline underline-offset-4 hover:text-brass"
                  >
                    output
                  </a>
                )}
              </div>
            </div>
            {task.qualityNotes && (
              <p className="mt-4 font-body text-sm text-paper-muted">{task.qualityNotes}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
