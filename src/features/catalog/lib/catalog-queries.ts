import { SPECIAL_SLOTS, type WeaponCamoSlot } from "@/features/progress/domain/camo-slots";

import {
  type Catalog,
  type GameMode,
  type Weapon,
  type WeaponCategory,
  type WeaponChallenge,
} from "../types/catalog.types";

export const DEFAULT_MODE_ID = "multiplayer";

/** Order used to pick a display name for special camos (names match across modes). */
const NAME_LOOKUP_MODES = ["multiplayer", "warzone", "dmz"];

export function getAllWeaponIds(catalog: Pick<Catalog, "categories">): string[] {
  return catalog.categories.flatMap((category) => category.weapons.map((weapon) => weapon.id));
}

export function isLaunchWeapon(weapon: Weapon): boolean {
  return weapon.availableSince === null;
}

export function findWeapon(
  catalog: Catalog,
  weaponId: string,
): { weapon: Weapon; category: WeaponCategory } | null {
  for (const category of catalog.categories) {
    const weapon = category.weapons.find((candidate) => candidate.id === weaponId);
    if (weapon) return { weapon, category };
  }
  return null;
}

export function findMode(catalog: Catalog, modeId: string): GameMode | null {
  return catalog.modes.find((mode) => mode.id === modeId) ?? null;
}

export function getWeaponChallenges(
  catalog: Catalog,
  weaponId: string,
  modeId: string,
): Partial<Record<WeaponCamoSlot, WeaponChallenge>> {
  const result: Partial<Record<WeaponCamoSlot, WeaponChallenge>> = {};
  for (const challenge of catalog.weaponChallenges) {
    if (challenge.weaponId === weaponId && challenge.modeId === modeId) {
      result[challenge.slot] = challenge;
    }
  }
  return result;
}

export type SpecialCamoNames = Record<string, Partial<Record<WeaponCamoSlot, string>>>;

/** Real names of each weapon's special camos (`null` in the data until revealed). */
export function getSpecialCamoNames(catalog: Catalog): SpecialCamoNames {
  const names: SpecialCamoNames = {};
  for (const modeId of [...NAME_LOOKUP_MODES].reverse()) {
    for (const challenge of catalog.weaponChallenges) {
      if (challenge.modeId !== modeId || !challenge.camoName) continue;
      if (!SPECIAL_SLOTS.includes(challenge.slot)) continue;
      (names[challenge.weaponId] ??= {})[challenge.slot] = challenge.camoName;
    }
  }
  return names;
}
