import { type MasteryChallenge } from "@/features/progress/domain/mastery";
import { type WeaponCamoSlot } from "@/features/progress/domain/camo-slots";

export interface GameMode {
  id: string;
  name: string;
  shortName: string;
  targetDescription: string | null;
}

export interface Weapon {
  id: string;
  name: string;
  categoryId: string;
  /** e.g. "Temporada 1"; `null` for launch weapons. */
  availableSince: string | null;
  /** Player level that unlocks the weapon; `null` while unknown (Season 1). */
  unlockLevel: number | null;
}

export interface WeaponCategory {
  id: string;
  name: string;
  weapons: Weapon[];
}

/** Requirement of a weapon camo in a specific mode. Unrevealed ones have `null` fields. */
export interface WeaponChallenge {
  id: string;
  modeId: string;
  weaponId: string;
  slot: WeaponCamoSlot;
  camoName: string | null;
  description: string | null;
  targetAmount: number | null;
  note: string | null;
}

export interface AccountCamo {
  id: string;
  camoName: string | null;
  description: string | null;
  note: string | null;
}

export interface Catalog {
  modes: GameMode[];
  categories: WeaponCategory[];
  weaponChallenges: WeaponChallenge[];
  masteries: MasteryChallenge[];
  divergence: AccountCamo | null;
}
