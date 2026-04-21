/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env vars missing");
    _supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Opt out of Next.js App Router fetch cache. Without this, SELECT
      // queries can be served stale for the lifetime of the deployment ,
      // once trapped a freshly-generated workspace behind a cached empty
      // response, making the app think it still needed generation.
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }
  return _supabase;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});
