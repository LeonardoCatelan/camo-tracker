import {
  CAMO_TIERS,
  getSlotTier,
  isSequentialTier,
  WEAPON_CAMO_SLOTS,
  type WeaponCamoSlot,
} from "./camo-slots";

function compareUnlockOrder(slot: WeaponCamoSlot, other: WeaponCamoSlot): number {
  const tier = getSlotTier(slot);
  const otherTier = getSlotTier(other);
  if (tier !== otherTier) return CAMO_TIERS.indexOf(otherTier) - CAMO_TIERS.indexOf(tier);
  if (!isSequentialTier(tier)) return 0; // independent camos inside the same tier
  return WEAPON_CAMO_SLOTS.indexOf(other) - WEAPON_CAMO_SLOTS.indexOf(slot);
}

/** Camos that must already be earned before `slot` (everything that comes before it). */
export function getPrerequisiteSlots(slot: WeaponCamoSlot): WeaponCamoSlot[] {
  return WEAPON_CAMO_SLOTS.filter((other) => compareUnlockOrder(slot, other) < 0);
}

/** Camos that depend on `slot` (everything that comes after it). */
export function getDependentSlots(slot: WeaponCamoSlot): WeaponCamoSlot[] {
  return WEAPON_CAMO_SLOTS.filter((other) => compareUnlockOrder(slot, other) > 0);
}

/**
 * The app does not block the unlock order, but keeps it consistent:
 * - completing a camo also completes everything that comes before it;
 * - un-completing a camo also clears everything that comes after it.
 */
export function getSlotsAffectedByToggle(
  slot: WeaponCamoSlot,
  completed: boolean,
): WeaponCamoSlot[] {
  return [slot, ...(completed ? getPrerequisiteSlots(slot) : getDependentSlots(slot))];
}
