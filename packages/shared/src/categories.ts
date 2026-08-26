export const CATEGORIES = [
  {
    slug: "rebalancing",
    name: "Rebalancing",
    description: "Manages LP ranges and resets positions automatically.",
  },
  {
    slug: "grid-trading",
    name: "Grid Trading",
    description: "Places and manages automated grid orders.",
  },
  {
    slug: "yield-optimisation",
    name: "Yield Optimisation",
    description: "Routes liquidity to the highest available APR.",
  },
  {
    slug: "health-factor",
    name: "Health Factor Monitoring",
    description: "Protects lending positions from liquidation.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
