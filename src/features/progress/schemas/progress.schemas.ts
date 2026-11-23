import { z } from "zod";

import { WEAPON_CAMO_SLOTS, type WeaponCamoSlot } from "../domain/camo-slots";

const catalogId = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-z0-9.-]+$/, { error: "Identificador inválido." });

export const toggleWeaponCamoSchema = z.object({
  weaponId: catalogId,
  slot: z.enum(WEAPON_CAMO_SLOTS as [WeaponCamoSlot, ...WeaponCamoSlot[]]),
  completed: z.boolean(),
});

export const masteryProgressSchema = z.object({
  challengeId: catalogId,
  progress: z.number().int().min(0).max(1_000_000),
});

export type ToggleWeaponCamoInput = z.infer<typeof toggleWeaponCamoSchema>;
export type MasteryProgressInput = z.infer<typeof masteryProgressSchema>;
