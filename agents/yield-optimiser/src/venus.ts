import { createPublicClient, http, type Address } from "viem";
import { bsc } from "viem/chains";

const client = createPublicClient({
  chain: bsc,
  transport: http(process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org"),
});

const VTOKEN_ABI = [
  {
    type: "function",
    name: "supplyRatePerBlock",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Verified vToken addresses (BscScan, cross-checked — vUSDT alone has
// 1.4M+ transactions, both actively used, not stale deployments). Same
// read interface for both: Venus's own protocol-math docs use vBNB as
// their canonical supplyRatePerBlock() example, confirming VToken /
// VBep20 / VBNB all share this function at the base contract level.
export const MARKETS = {
  USDT: { vToken: "0xfd5840Cd36d94D7229439859C0112a4185BC0255", symbol: "USDT" },
  BNB: { vToken: "0xA07c5b74C9B40447a954e1466938b865b6BBea36", symbol: "BNB" },
} as const;

// Venus's own official annualization formula
// (docs-v4.venus.io/guides/protocol-math): current BSC block time is
// 0.75s -> 80 blocks/min -> 115,200 blocks/day, compounded daily over
// 365 days. Not a reconstruction — this is their published formula.
const BLOCKS_PER_DAY = 80 * 60 * 24;
const DAYS_PER_YEAR = 365;
const MANTISSA = 1e18;

export interface MarketApy {
  symbol: string;
  vToken: Address;
  supplyApyPercent: number;
  fetchedAt: string;
}

export async function getSupplyApy(key: keyof typeof MARKETS): Promise<MarketApy> {
  const market = MARKETS[key];
  const ratePerBlock = await client.readContract({
    address: market.vToken as Address,
    abi: VTOKEN_ABI,
    functionName: "supplyRatePerBlock",
  });

  const dailyRate = (Number(ratePerBlock) / MANTISSA) * BLOCKS_PER_DAY;
  const supplyApyPercent = (Math.pow(1 + dailyRate, DAYS_PER_YEAR) - 1) * 100;

  return {
    symbol: market.symbol,
    vToken: market.vToken as Address,
    supplyApyPercent,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getAllMarketApys(): Promise<MarketApy[]> {
  return Promise.all((Object.keys(MARKETS) as (keyof typeof MARKETS)[]).map(getSupplyApy));
}
