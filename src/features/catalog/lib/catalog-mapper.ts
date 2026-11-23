import { isWeaponCamoSlot, type WeaponCamoSlot } from "@/features/progress/domain/camo-slots";
import { type Tables } from "@/types/database.types";

import { type Catalog } from "../types/catalog.types";

export const MODE_SHORT_NAMES: Readonly<Record<string, string>> = {
  multiplayer: "MP",
  dmz: "DMZ",
  warzone: "WZ",
};

export interface CatalogRows {
  modes: Tables<"game_modes">[];
  categories: Tables<"weapon_categories">[];
  weapons: Tables<"weapons">[];
  challenges: Tables<"challenges">[];
}

const bySortOrder = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

/**
 * Weapons inside a category follow the in-game unlock level. Weapons without a known
 * level (Season 1) go last; ties keep the catalog order.
 */
export function compareWeapons(a: Tables<"weapons">, b: Tables<"weapons">): number {
  const levelA = a.unlock_level ?? Number.POSITIVE_INFINITY;
  const levelB = b.unlock_level ?? Number.POSITIVE_INFINITY;
  return levelA === levelB ? a.sort_order - b.sort_order : levelA - levelB;
}

/** Maps a weapon challenge row to the per-weapon camo it belongs to. */
export function getChallengeSlot(row: Tables<"challenges">): WeaponCamoSlot | null {
  const candidate = row.kind === "special" ? `special_${row.sort_order}` : row.kind;
  return isWeaponCamoSlot(candidate) ? candidate : null;
}

/** Converts raw database rows into the catalog used by the UI (sorted and grouped). */
export function mapCatalog(rows: CatalogRows): Catalog {
  const weapons = [...rows.weapons].sort(compareWeapons);
  const challenges = [...rows.challenges].sort(bySortOrder);
  const divergence = challenges.find((row) => row.kind === "divergence");

  return {
    modes: [...rows.modes].sort(bySortOrder).map((mode) => ({
      id: mode.id,
      name: mode.name,
      shortName: MODE_SHORT_NAMES[mode.id] ?? mode.name,
      targetDescription: mode.target_description,
    })),
    categories: [...rows.categories].sort(bySortOrder).map((category) => ({
      id: category.id,
      name: category.name,
      weapons: weapons
        .filter((weapon) => weapon.category_id === category.id)
        .map((weapon) => ({
          id: weapon.id,
          name: weapon.name,
          categoryId: weapon.category_id,
          availableSince: weapon.available_since,
          unlockLevel: weapon.unlock_level,
        })),
    })),
    weaponChallenges: challenges.flatMap((row) => {
      const slot = getChallengeSlot(row);
      if (!slot || !row.weapon_id || !row.mode_id) return [];
      return [
        {
          id: row.id,
          modeId: row.mode_id,
          weaponId: row.weapon_id,
          slot,
          camoName: row.camo_name,
          description: row.description,
          targetAmount: row.target_amount,
          note: row.note,
        },
      ];
    }),
    masteries: challenges.flatMap((row) =>
      row.kind === "mastery" && row.mode_id
        ? [
            {
              id: row.id,
              modeId: row.mode_id,
              camoName: row.camo_name,
              description: row.description,
              targetAmount: row.target_amount,
              note: row.note,
              sortOrder: row.sort_order,
            },
          ]
        : [],
    ),
    divergence: divergence
      ? {
          id: divergence.id,
          camoName: divergence.camo_name,
          description: divergence.description,
          note: divergence.note,
        }
      : null,
  };
}
