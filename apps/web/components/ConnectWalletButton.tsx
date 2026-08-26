"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="h-fit rounded border border-paper-muted px-3.5 py-2 font-data text-[11px] uppercase tracking-[0.1em] text-paper-muted hover:text-paper"
      >
        {truncate(address)}
      </button>
    );
  }

  const injectedConnector = connectors[0];

  return (
    <button
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      disabled={!injectedConnector || isPending}
      className="h-fit rounded bg-brass px-3.5 py-2 font-data text-[11px] uppercase tracking-[0.1em] text-ink disabled:opacity-50"
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
