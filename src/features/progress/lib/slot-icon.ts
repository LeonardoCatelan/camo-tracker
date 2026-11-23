import { type CamoIconVariant } from "@/features/camos/components/camo-icon";

import { getSlotPosition, getSlotTier, type WeaponCamoSlot } from "../domain/camo-slots";

/** Icon family used for each weapon camo slot. */
export function getSlotIcon(slot: WeaponCamoSlot): { variant: CamoIconVariant; index: number } {
  const tier = getSlotTier(slot);
  const variant: CamoIconVariant =
    tier === "military" ? "military" : tier === "special" ? "named" : tier;
  return { variant, index: getSlotPosition(slot) };
}
