import { createPublicClient, http, type Address } from "viem";
import { bsc } from "viem/chains";

const client = createPublicClient({
  chain: bsc,
  transport: http(process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org"),
});

// Verified directly against PancakeSwap's own official developer docs
// (developer.pancakeswap.finance/contracts/v3/addresses), BSC mainnet —
// same Factory this project already uses in apps/api/src/chain/pancakeswap.ts.
const FACTORY_ADDRESS = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865" as const;
const POSITION_MANAGER_ADDRESS = "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364" as const;

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

// Signature confirmed against PancakeSwap's own NonfungiblePositionManager docs.
const POSITION_MANAGER_ABI = [
  {
    type: "function",
    name: "positions",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "nonce", type: "uint96" },
      { name: "operator", type: "address" },
      { name: "token0", type: "address" },
      { name: "token1", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "tickLower", type: "int24" },
      { name: "tickUpper", type: "int24" },
      { name: "liquidity", type: "uint128" },
      { name: "feeGrowthInside0LastX128", type: "uint256" },
      { name: "feeGrowthInside1LastX128", type: "uint256" },
      { name: "tokensOwed0", type: "uint128" },
      { name: "tokensOwed1", type: "uint128" },
    ],
  },
] as const;

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
] as const;

export interface PositionSnapshot {
  tokenId: bigint;
  poolAddress: Address;
  tickLower: number;
  tickUpper: number;
  currentTick: number;
  liquidity: string;
  inRange: boolean;
  fetchedAt: string;
}

export async function getPositionSnapshot(tokenId: bigint): Promise<PositionSnapshot> {
  const position = await client.readContract({
    address: POSITION_MANAGER_ADDRESS,
    abi: POSITION_MANAGER_ABI,
    functionName: "positions",
    args: [tokenId],
  });

  const [, , token0, token1, fee, tickLower, tickUpper, liquidity] = position;

  const poolAddress = await client.readContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getPool",
    args: [token0, token1, fee],
  });

  const slot0 = await client.readContract({ address: poolAddress, abi: POOL_ABI, functionName: "slot0" });
  const currentTick = slot0[1];
  const inRange = currentTick >= tickLower && currentTick < tickUpper;

  return {
    tokenId,
    poolAddress,
    tickLower,
    tickUpper,
    currentTick,
    liquidity: liquidity.toString(),
    inRange,
    fetchedAt: new Date().toISOString(),
  };
}
