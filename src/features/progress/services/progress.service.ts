import "server-only";

import { requireUser } from "@/features/auth/services/session.service";
import { createClient } from "@/lib/supabase/server";

import { toCamoKey } from "../domain/completed-camos";

export interface UserProgress {
  /** Completed weapon camos as `<weaponId>:<slot>` keys (serializable for the client). */
  completedCamos: string[];
  /** Manual progress of mastery camos, by challenge id. */
  masteryProgress: Record<string, number>;
}

/** Reads the signed-in user's progress at request time (render inside <Suspense>). */
export async function getUserProgress(redirectTo?: string): Promise<UserProgress> {
  const user = await requireUser(redirectTo);
  const supabase = await createClient();

  const [camos, challengeProgress] = await Promise.all([
    supabase.from("user_weapon_camos").select("weapon_id, slot").eq("user_id", user.id),
    supabase
      .from("user_challenge_progress")
      .select("challenge_id, progress")
      .eq("user_id", user.id),
  ]);

  const error = camos.error ?? challengeProgress.error;
  if (error) throw new Error(`Falha ao carregar o progresso: ${error.message}`);

  return {
    completedCamos: (camos.data ?? []).map((row) => toCamoKey(row.weapon_id, row.slot)),
    masteryProgress: Object.fromEntries(
      (challengeProgress.data ?? []).map((row) => [row.challenge_id, row.progress]),
    ),
  };
}
