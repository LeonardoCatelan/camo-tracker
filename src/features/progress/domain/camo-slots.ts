import { Constants, type Enums } from "@/types/database.types";

/** A camo that is earned once per weapon, in any game mode. */
export type WeaponCamoSlot = Enums<"weapon_camo_slot">;

/** Every weapon camo, in unlock order. */
export const WEAPON_CAMO_SLOTS: readonly WeaponCamoSlot[] = Constants.public.Enums.weapon_camo_slot;

export type CamoTier = "military" | "special" | "gold" | "platinum" | "harmonic_break";

/** Tiers in unlock order: Militares → Especiais → Ouro → Platina → Dissonância. */
export const CAMO_TIERS: readonly CamoTier[] = [
  "military",
  "special",
  "gold",
  "platinum",
  "harmonic_break",
];

export const CAMO_TIER_LABELS: Readonly<Record<CamoTier, string>> = {
  military: "Militares",
  special: "Especiais",
  gold: "Ouro",
  platinum: "Platina",
  harmonic_break: "Dissonância",
};

/**
 * Tiers whose camos unlock one after another (Militar 1 → 8). Special camos are
 * independent from each other: each one only requires the military tier.
 */
const SEQUENTIAL_TIERS: ReadonlySet<CamoTier> = new Set<CamoTier>(["military"]);

export function isSequentialTier(tier: CamoTier): boolean {
  return SEQUENTIAL_TIERS.has(tier);
}

export function getSlotTier(slot: WeaponCamoSlot): CamoTier {
  if (slot.startsWith("military_")) return "military";
  if (slot.startsWith("special_")) return "special";
  return slot as Exclude<CamoTier, "military" | "special">;
}

/** 1-based position inside the tier (e.g. `military_3` → 3); single-camo tiers return 1. */
export function getSlotPosition(slot: WeaponCamoSlot): number {
  const match = /_(\d+)$/.exec(slot);
  return match?.[1] ? Number(match[1]) : 1;
}

export function getSlotsOfTier(tier: CamoTier): WeaponCamoSlot[] {
  return WEAPON_CAMO_SLOTS.filter((slot) => getSlotTier(slot) === tier);
}

export const MILITARY_SLOTS = getSlotsOfTier("military");
export const SPECIAL_SLOTS = getSlotsOfTier("special");

/** Generic label; special camos are usually displayed with their real name instead. */
export function getSlotLabel(slot: WeaponCamoSlot): string {
  const tier = getSlotTier(slot);
  if (tier === "military") return `Militar ${getSlotPosition(slot)}`;
  if (tier === "special") return `Especial ${getSlotPosition(slot)}`;
  return CAMO_TIER_LABELS[tier];
}

export function isWeaponCamoSlot(value: string): value is WeaponCamoSlot {
  return (WEAPON_CAMO_SLOTS as readonly string[]).includes(value);
}
