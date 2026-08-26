import type { Agent, AgentStat } from "@roster/shared";

const ACCENT_BG: Record<string, string> = {
  rebalancing: "bg-brass",
  "grid-trading": "bg-teal",
  "yield-optimisation": "bg-moss",
  "health-factor": "bg-coral",
};

const LABELS: Record<string, string> = {
  rebalancing: "REBALANCING",
  "grid-trading": "GRID TRADING",
  "yield-optimisation": "YIELD OPT.",
  "health-factor": "HEALTH FACTOR",
};

export function RosterCard({ agent }: { agent: Agent & { stats: AgentStat[] } }) {
  const accent = ACCENT_BG[agent.category];
  return (
    <div className="flex w-[296px] flex-col gap-4 rounded-lg bg-ink-elevated p-5">
      <div className={`w-fit rounded px-2 py-1 ${accent}`}>
        <span className="font-data text-[11px] tracking-[0.1em] text-ink">
          {LABELS[agent.category]}
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-paper">{agent.callsign}</h3>

      <div className="flex gap-7">
        {agent.stats.slice(0, 2).map((stat) => (
          <div key={stat.metric} className="flex flex-col gap-1">
            <span className="font-data text-[11px] tracking-[0.1em] text-paper-muted">
              {stat.metric}
            </span>
            <span className="font-data text-xl font-semibold text-paper">
              {stat.value}
              {stat.unit ?? ""}
            </span>
          </div>
        ))}
      </div>

      <button className={`rounded py-2.5 font-data text-[11px] tracking-[0.1em] text-ink ${accent}`}>
        ACTIVATE
      </button>
    </div>
  );
}
