"use server";

import { refresh } from "next/cache";

import { createAuthService } from "@/features/auth/services/auth.service";
import { getCatalog } from "@/features/catalog/services/catalog.service";
import { createClient } from "@/lib/supabase/server";
import { actionFailure, actionSuccess, validationFailure } from "@/lib/utils/action-result";
import { type ActionResult } from "@/types/action-result";

import { getSlotsAffectedByToggle } from "../domain/camo-cascade";
import { clampMasteryProgress } from "../domain/mastery";
import { masteryProgressSchema, toggleWeaponCamoSchema } from "../schemas/progress.schemas";

// Server Actions are public HTTP endpoints: inputs are re-validated and the user always
// comes from the server-side session, never from the request payload.

const SESSION_EXPIRED = "Sua sessão expirou. Entre novamente.";
const SAVE_FAILED = "Não foi possível salvar o progresso. Tente novamente.";

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const user = await createAuthService(supabase).getCurrentUser();
  return { supabase, user };
}

function logDatabaseError(context: string, error: { code?: string; message: string }) {
  console.error(`[progress] ${context}:`, { code: error.code, message: error.message });
}

/** Marks or unmarks a weapon camo, cascading through the unlock order of that weapon. */
export async function toggleWeaponCamoAction(input: unknown): Promise<ActionResult> {
  const parsed = toggleWeaponCamoSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return actionFailure(SESSION_EXPIRED);

  const { weaponId, slot, completed } = parsed.data;
  const slots = getSlotsAffectedByToggle(slot, completed);
  const table = supabase.from("user_weapon_camos");

  // Each branch is a single SQL statement, so the cascade is applied atomically.
  const { error } = completed
    ? await table.upsert(
        slots.map((affected) => ({ user_id: user.id, weapon_id: weaponId, slot: affected })),
        { onConflict: "user_id,weapon_id,slot", ignoreDuplicates: true },
      )
    : await table.delete().eq("user_id", user.id).eq("weapon_id", weaponId).in("slot", slots);

  if (error) {
    logDatabaseError("Falha ao salvar camuflagem", error);
    return actionFailure(SAVE_FAILED);
  }

  refresh();
  return actionSuccess();
}

/** Saves the manual progress of a mastery camo (completed once the target is reached). */
export async function setMasteryProgressAction(input: unknown): Promise<ActionResult> {
  const parsed = masteryProgressSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return actionFailure(SESSION_EXPIRED);

  const catalog = await getCatalog();
  const mastery = catalog.masteries.find((item) => item.id === parsed.data.challengeId);
  if (!mastery) return actionFailure("Desafio de maestria inválido.");

  const progress = clampMasteryProgress(parsed.data.progress, mastery.targetAmount);
  const completed = mastery.targetAmount !== null && progress >= mastery.targetAmount;

  const { error } = await supabase.from("user_challenge_progress").upsert(
    {
      user_id: user.id,
      challenge_id: mastery.id,
      progress,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,challenge_id" },
  );

  if (error) {
    logDatabaseError("Falha ao salvar maestria", error);
    return actionFailure(SAVE_FAILED);
  }

  refresh();
  return actionSuccess();
}
