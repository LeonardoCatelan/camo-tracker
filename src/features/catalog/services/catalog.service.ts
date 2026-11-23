import "server-only";

import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";

import { getPublicEnv } from "@/lib/env";
import { type Database } from "@/types/database.types";

import { mapCatalog } from "../lib/catalog-mapper";
import { type Catalog } from "../types/catalog.types";

export const CATALOG_CACHE_TAG = "catalog";

/**
 * Weapons and challenges are the same for every user and only change when the JSON is
 * re-imported, so they are cached on the server. The catalog is readable with the
 * publishable key (RLS allows it); only user progress requires a session.
 *
 * Call it after the request-time user check, so it never runs while prerendering.
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_CACHE_TAG);

  const env = getPublicEnv();
  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const [modes, categories, weapons, challenges] = await Promise.all([
    supabase.from("game_modes").select("*"),
    supabase.from("weapon_categories").select("*"),
    supabase.from("weapons").select("*"),
    supabase.from("challenges").select("*"),
  ]);

  const error = modes.error ?? categories.error ?? weapons.error ?? challenges.error;
  if (error) throw new Error(`Falha ao carregar o catálogo: ${error.message}`);

  return mapCatalog({
    modes: modes.data ?? [],
    categories: categories.data ?? [],
    weapons: weapons.data ?? [],
    challenges: challenges.data ?? [],
  });
}
