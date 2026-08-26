import Link from "next/link";
import { notFound } from "next/navigation";
import { mockAgents } from "@/lib/mock-agents";
import { ActivateButton } from "@/components/ActivateButton";

const ACCENT_BG: Record<string, string> = {
  rebalancing: "bg-brass",
  "grid-trading": "bg-teal",
  "yield-optimisation": "bg-moss",
  "health-factor": "bg-coral",
};

const LABELS: Record<string, string> = {
  rebalancing: "REBALANCING",
  "grid-trading": "GRID TRADING",
  "yield-optimisation": "YIELD OPTIMISATION",
  "health-factor": "HEALTH FACTOR MONITORING",
};

function explorerUrl(address: string, chain: string) {
  const base = chain === "bsc" ? "https://bscscan.com" : "https://testnet.bscscan.com";
  return `${base}/address/${address}`;
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = mockAgents.find((a) => a.id === params.id);
  if (!agent) notFound();

  const accent = ACCENT_BG[agent.category];

  return (
    <main className="mx-auto max-w-[860px] px-8 py-16">
      <Link
        href="/"
        className="font-data text-[11px] uppercase tracking-[0.1em] text-paper-muted hover:text-paper"
      >
        ← All agents
      </Link>

      <div className={`mt-8 w-fit rounded px-2 py-1 ${accent}`}>
        <span className="font-data text-[11px] tracking-[0.1em] text-ink">{LABELS[agent.category]}</span>
      </div>

      <h1 className="mt-4 font-display text-4xl font-bold text-paper">{agent.callsign}</h1>
      <p className="mt-3 max-w-[560px] font-body text-base text-paper-muted">{agent.description}</p>

      <div className="mt-8 flex gap-10 border-t border-ink-elevated pt-8">
        {agent.stats.map((stat) => (
          <div key={stat.metric} className="flex flex-col gap-1">
            <span className="font-data text-[11px] tracking-[0.1em] text-paper-muted">{stat.metric}</span>
            <span className="font-data text-2xl font-semibold text-paper">
              {stat.value}
              {stat.unit ?? ""}
            </span>
          </div>
        ))}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-ink-elevated pt-8 font-body text-sm">
        <div>
          <dt className="text-paper-muted">Wallet</dt>
          <dd className="mt-1">
            <a
              href={explorerUrl(agent.walletAddress, agent.chain)}
              target="_blank"
              rel="noreferrer"
              className="text-paper underline decoration-paper-muted underline-offset-4 hover:text-brass"
            >
              {agent.walletAddress.slice(0, 6)}…{agent.walletAddress.slice(-4)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-paper-muted">Chain</dt>
          <dd className="mt-1 text-paper">{agent.chain === "bsc" ? "BNB Smart Chain" : "BSC Testnet"}</dd>
        </div>
        <div>
          <dt className="text-paper-muted">Status</dt>
          <dd className="mt-1 capitalize text-paper">{agent.status}</dd>
        </div>
      </dl>

      <div className="mt-10 max-w-[320px]">
        <ActivateButton agentId={agent.id} accentClass={accent} />
      </div>
    </main>
  );
}
