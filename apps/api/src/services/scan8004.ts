// 8004scan — the free hackathon resource flagged in Session 1 and never
// wired up until now. Official API, confirmed live via their own
// Developer Hub (fetched directly): base https://api.8004scan.io/api/v1,
// anonymous tier works with no key (30 req/min, 1,000/day) — a real key
// (SCAN8004_API_KEY) just raises the ceiling, it isn't required to
// function. Full endpoint list and params confirmed against their
// published OpenAPI spec.

const BASE_URL = process.env.SCAN8004_BASE_URL ?? "https://api.8004scan.io/api/v1";
const API_KEY = process.env.SCAN8004_API_KEY || null;

// BSC mainnet's chain_id in 8004scan's registry. Standard EVM chain id —
// the same 56 every wallet and block explorer uses for BSC — not
// something specific to 8004scan's own numbering, so not separately
// re-verified against their GET /chains endpoint. If agents don't show
// up, that endpoint is the first thing to check.
export const BSC_CHAIN_ID = 56;

async function scan8004Fetch(path: string, params: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {};
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(`8004scan request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Anonymous tier is 30 req/min shared across every Roster visitor hitting
// this without a key — cheap to cache, expensive not to.
let listCache: { key: string; data: unknown; expiresAt: number } | null = null;
const LIST_TTL_MS = 60_000;

export async function listBscAgents(params: {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const cacheKey = JSON.stringify(params);
  if (listCache && listCache.key === cacheKey && listCache.expiresAt > Date.now()) {
    return listCache.data;
  }

  const data = await scan8004Fetch("/agents", {
    chain_id: BSC_CHAIN_ID,
    is_testnet: false,
    is_registered: "true", // real registrations only — excludes placeholders/defective entries
    limit: params.limit ?? 24,
    offset: params.offset ?? 0,
    search: params.search,
    sort_by: params.sortBy ?? "total_score",
    sort_order: params.sortOrder ?? "desc",
  });

  listCache = { key: cacheKey, data, expiresAt: Date.now() + LIST_TTL_MS };
  return data;
}

export async function getBscAgent(tokenId: string) {
  return scan8004Fetch(`/agents/${BSC_CHAIN_ID}/${tokenId}`, {});
}
