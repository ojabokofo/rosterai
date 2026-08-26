import { createPublicClient, http, type Chain } from "viem";
import { bsc, bscTestnet } from "viem/chains";

const env = process.env.CHAIN_ENV === "mainnet" ? "mainnet" : "testnet";
const chain: Chain = env === "mainnet" ? bsc : bscTestnet;
const rpcUrl =
  env === "mainnet"
    ? (process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org")
    : (process.env.BSC_TESTNET_RPC_URL ?? "https://data-seed-prebsc-1-s1.binance.org:8545");

// Read-only client for now: verifying an agent's wallet is actually live on
// BSC (balance, tx count) for the main-track eligibility requirement. Write
// access (submitting txns on the platform's behalf) is intentionally not
// wired up yet — that's a Session 2+ decision once the settlement/hiring
// flow for TermiX is scoped.
export const chainClient = createPublicClient({ chain, transport: http(rpcUrl) });

export async function isWalletActiveOnChain(address: `0x${string}`) {
  const [balance, txCount] = await Promise.all([
    chainClient.getBalance({ address }),
    chainClient.getTransactionCount({ address }),
  ]);
  return { address, balance: balance.toString(), txCount, chain: env };
}
