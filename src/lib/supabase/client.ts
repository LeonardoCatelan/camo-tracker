import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";
import { type Database } from "@/types/database.types";

import { type TypedSupabaseClient } from "./types";

/** Supabase client for Client Components. Session is persisted in cookies. */
export function createClient(): TypedSupabaseClient {
  const env = getPublicEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
