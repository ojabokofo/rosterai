import { createPublicClient, http } from "viem";
import { bsc } from "viem/chains";

// Reads live PancakeSwap V3 pool state directly from BSC mainnet — not a
// third-party indexer or cached API. Deliberately its own mainnet-only
// client, independent of CHAIN_ENV (which defaults to testnet for the
// agent-wallet checks in client.ts): PancakeSwap's real liquidity lives
// on mainnet, and reading testnet contracts here would silently return
// empty/meaningless pools.
const mainnetClient = createPublicClient({
  chain: bsc,
  transport: http(process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org"),
});

// PancakeV3Factory — same address on BSC mainnet and testnet. Verified
// against developer.pancakeswap.finance/contracts/v3/addresses (official
// docs) and cross-checked on BscScan.
const FACTORY_ADDRESS = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865" as const;

const FACTORY_ABI = [
  {
    type: "function",
    name: "getPool",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const;

// Standard Uniswap-v3-shaped pool interface — PancakeSwap v3 is an
// explicit fork, per PancakeSwap's own developer docs.
const POOL_ABI = [
  {
    type: "function",
    name: "slot0",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint32" },
      { name: "unlocked", type: "bool" },
    ],
  },
  { type: "function", name: "liquidity", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint128" }] },
  { type: "function", name: "token0", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
  { type: "function", name: "token1", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
] as const;

// Known-good BSC mainnet token addresses. WBNB confirmed against
// PancakeSwap's own pancake-info-api docs; CAKE confirmed as the worked
// example in that same doc. Add more here only once *you've* checked the
// address yourself (BscScan / PancakeSwap's token list) — a wrong address
// either reverts cleanly or, worse, silently resolves to an unrelated
// contract.
export const TOKENS = {
  WBNB: { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "WBNB", decimals: 18 },
  CAKE: { address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", symbol: "CAKE", decimals: 18 },
} as const;

type TokenKey = keyof typeof TOKENS;

export const TRACKED_PAIRS: { tokenA: TokenKey; tokenB: TokenKey; fee: number }[] = [
  { tokenA: "CAKE", tokenB: "WBNB", fee: 2500 }, // PancakeSwap's own flagship pair, 0.25% tier
];

const Q96 = 2 ** 96;

// Number-precision math, not BigInt/decimal-exact — fine for a live
// display figure, not for anything that moves funds.
function sqrtPriceX96ToPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number) {
  const ratio = Number(sqrtPriceX96) / Q96;
  return ratio * ratio * 10 ** (decimals0 - decimals1);
}

export interface LivePoolSnapshot {
  pairLabel: string;
  poolAddress: string;
  feeTierBps: number;
  token0Symbol: string;
  token1Symbol: string;
  price: number;
  liquidity: string;
  fetchedAt: string;
}

export async function getLivePoolSnapshot(tokenAKey: TokenKey, tokenBKey: TokenKey, fee: number): Promise<LivePoolSnapshot> {
  const tokenA = TOKENS[tokenAKey];
  const tokenB = TOKENS[tokenBKey];

  const poolAddress = await mainnetClient.readContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getPool",
    args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`, fee],
  });

  if (!poolAddress || poolAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(`No PancakeSwap V3 pool for ${tokenAKey}/${tokenBKey} at ${fee / 10000}% fee`);
  }

  const [slot0, liquidity, token0Address] = await Promise.all([
    mainnetClient.readContract({ address: poolAddress, abi: POOL_ABI, functionName: "slot0" }),
    mainnetClient.readContract({ address: poolAddress, abi: POOL_ABI, functionName: "liquidity" }),
    mainnetClient.readContract({ address: poolAddress, abi: POOL_ABI, functionName: "token0" }),
  ]);

  const token0IsA = token0Address.toLowerCase() === tokenA.address.toLowerCase();
  const [decimals0, decimals1, symbol0, symbol1] = token0IsA
    ? [tokenA.decimals, tokenB.decimals, tokenA.symbol, tokenB.symbol]
    : [tokenB.decimals, tokenA.decimals, tokenB.symbol, tokenA.symbol];

  return {
    pairLabel: `${tokenAKey}/${tokenBKey}`,
    poolAddress,
    feeTierBps: fee,
    token0Symbol: symbol0,
    token1Symbol: symbol1,
    price: sqrtPriceX96ToPrice(slot0[0], decimals0, decimals1),
    liquidity: liquidity.toString(),
    fetchedAt: new Date().toISOString(),
  };
}

async function getAllTrackedPools(): Promise<LivePoolSnapshot[]> {
  return Promise.all(TRACKED_PAIRS.map((p) => getLivePoolSnapshot(p.tokenA, p.tokenB, p.fee)));
}

let cache: { data: LivePoolSnapshot[]; expiresAt: number } | null = null;
const TTL_MS = 30_000;

export async function getAllTrackedPoolsCached(): Promise<LivePoolSnapshot[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  const data = await getAllTrackedPools();
  cache = { data, expiresAt: Date.now() + TTL_MS };
  return data;
}
