import { getSlotsAffectedByToggle } from "./camo-cascade";
import { type WeaponCamoSlot } from "./camo-slots";

/** Serializable identifier of a completed camo: `<weaponId>:<slot>`. */
export type CamoKey = `${string}:${WeaponCamoSlot}`;

/** Set of camos the user has completed, across every weapon. */
export type CompletedCamos = ReadonlySet<string>;

export interface CamoToggle {
  weaponId: string;
  slot: WeaponCamoSlot;
  completed: boolean;
}

export function toCamoKey(weaponId: string, slot: WeaponCamoSlot): CamoKey {
  return `${weaponId}:${slot}`;
}

export function isCamoCompleted(
  completed: CompletedCamos,
  weaponId: string,
  slot: WeaponCamoSlot,
): boolean {
  return completed.has(toCamoKey(weaponId, slot));
}

/** Applies a toggle (with its cascade) and returns a new set; the input is never mutated. */
export function applyCamoToggle(completed: CompletedCamos, toggle: CamoToggle): Set<string> {
  const next = new Set(completed);
  for (const slot of getSlotsAffectedByToggle(toggle.slot, toggle.completed)) {
    const key = toCamoKey(toggle.weaponId, slot);
    if (toggle.completed) next.add(key);
    else next.delete(key);
  }
  return next;
}
