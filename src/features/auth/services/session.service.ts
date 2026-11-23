import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { buildLoginPath } from "@/lib/utils/routes";

import { type AuthUser } from "../types/auth.types";

import { createAuthService } from "./auth.service";

/** Server-side accessor for the current user. Reads cookies, so render it inside <Suspense>. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  // With Partial Prefetching the App Shell can read cookies, so cookies() alone no longer
  // stops prerendering. Supabase compares the token expiry with Date.now(), which must
  // only run at request time; connection() defers the lookup until then.
  await connection();
  const supabase = await createClient();
  return createAuthService(supabase).getCurrentUser();
}

/**
 * Returns the authenticated user or redirects to login. Use it close to the data in
 * pages, Server Actions and Route Handlers: the proxy alone is not an authorization layer.
 */
export async function requireUser(redirectTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(buildLoginPath(redirectTo));
  return user;
}
