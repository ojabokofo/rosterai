import { createPublicClient, http, type Address } from "viem";
import { bsc } from "viem/chains";

// Venus Protocol — Core Pool Comptroller on BSC mainnet. Verified against
// BscScan (Venus: Core Pool Comptroller — ~$35M balance, 800k+ txns; the
// real, actively-used contract, not a stale deployment) and cross-checked
// against Venus's own v4 docs plus a public Code4rena audit of the
// Comptroller source.
const COMPTROLLER_ADDRESS = "0xfd36E2c2a6789Db23113685031d7F16329158384" as const;

const COMPTROLLER_ABI = [
  {
    type: "function",
    name: "getAccountLiquidity",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "error", type: "uint256" },
      { name: "liquidity", type: "uint256" },
      { name: "shortfall", type: "uint256" },
    ],
  },
] as const;

const client = createPublicClient({
  chain: bsc,
  transport: http(process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org"),
});

export interface AccountSnapshot {
  address: Address;
  liquidityUsd: number; // both scaled 1e18 (Venus/Compound "mantissa"), already USD
  shortfallUsd: number;
  // Venus/Compound protocols don't expose a single "health factor" ratio
  // like Aave — shortfall > 0 means the account is under-collateralized
  // *right now* and liquidatable. That's the ground-truth signal this
  // agent watches, not a synthetic ratio.
  status: "healthy" | "low_buffer" | "at_risk";
  fetchedAt: string;
}

const MANTISSA = 1e18;
const LOW_BUFFER_USD = Number(process.env.LOW_BUFFER_USD ?? 50);

export async function getAccountSnapshot(address: Address): Promise<AccountSnapshot> {
  const [, liquidity, shortfall] = await client.readContract({
    address: COMPTROLLER_ADDRESS,
    abi: COMPTROLLER_ABI,
    functionName: "getAccountLiquidity",
    args: [address],
  });

  const liquidityUsd = Number(liquidity) / MANTISSA;
  const shortfallUsd = Number(shortfall) / MANTISSA;

  const status: AccountSnapshot["status"] =
    shortfallUsd > 0 ? "at_risk" : liquidityUsd < LOW_BUFFER_USD ? "low_buffer" : "healthy";

  return { address, liquidityUsd, shortfallUsd, status, fetchedAt: new Date().toISOString() };
}
