"use client";

import { useEffect, useState } from "react";

interface PoolSnapshot {
  pairLabel: string;
  poolAddress: string;
  feeTierBps: number;
  token0Symbol: string;
  token1Symbol: string;
  price: number;
  liquidity: string;
  fetchedAt: string;
}

// Fails silently (renders nothing) if the API is down or the RPC read
// errors — this is a nice-to-have data point, not something that should
// ever break the discovery page.
export function PancakeSwapTicker() {
  const [pools, setPools] = useState<PoolSnapshot[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${base}/pancakeswap/pools`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setPools)
      .catch(() => setFailed(true));
  }, []);

  if (failed || !pools || pools.length === 0) return null;

  return (
    <div className="mt-10 flex flex-wrap items-center gap-6 rounded-lg bg-ink-elevated px-5 py-3">
      <span className="font-data text-[11px] uppercase tracking-[0.1em] text-paper-muted">
        Live from PancakeSwap
      </span>
      {pools.map((pool) => (
        <a
          key={pool.poolAddress}
          href={`https://bscscan.com/address/${pool.poolAddress}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 font-data text-sm text-paper hover:text-brass"
        >
          <span>
            {pool.token0Symbol}/{pool.token1Symbol}
          </span>
          <span className="text-paper-muted">·</span>
          <span>{pool.price.toFixed(4)}</span>
          <span className="text-paper-muted">({pool.feeTierBps / 10000}% pool)</span>
        </a>
      ))}
    </div>
  );
}
