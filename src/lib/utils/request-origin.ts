import "server-only";

import { headers } from "next/headers";

/**
 * Resolves the public origin of the current request (e.g. `https://app.example.com`).
 * Used to build email links; Supabase only accepts URLs present in its Redirect URLs allow-list.
 */
export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();

  const origin = requestHeaders.get("origin");
  if (origin) return origin;

  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) throw new Error("Não foi possível determinar a origem da requisição.");

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}
