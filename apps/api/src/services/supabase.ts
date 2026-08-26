import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — routes that touch the database will fail until apps/api/.env is configured."
  );
}

// Server-side client: uses the service role key, never expose this to apps/web.
export const supabase = createClient(url ?? "", serviceKey ?? "");
