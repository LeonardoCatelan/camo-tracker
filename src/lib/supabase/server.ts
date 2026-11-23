import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnv } from "@/lib/env";
import { type Database } from "@/types/database.types";

import { type TypedSupabaseClient } from "./types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create a new client per request; never share it across requests.
 */
export async function createClient(): Promise<TypedSupabaseClient> {
  // Read cookies first: it marks the caller as request-time, so prerendering stops here
  // instead of requiring environment variables during `next build`.
  const cookieStore = await cookies();
  const env = getPublicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies. This is safe to ignore because
            // the proxy (src/proxy.ts) refreshes the session on every request.
          }
        },
      },
    },
  );
}
