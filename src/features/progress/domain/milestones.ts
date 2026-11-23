import { CAMO_TIER_LABELS } from "./camo-slots";
import { isCamoCompleted, type CompletedCamos } from "./completed-camos";

/**
 * Large-scale milestones require a camo on 33 weapons (the launch count). Any weapon
 * counts, including Season 1 ones: using them lets the player skip other weapons.
 */
export const REQUIRED_WEAPON_COUNT = 33;

export type ScaleMilestoneKey = "gold" | "platinum" | "harmonic_break";

export const SCALE_MILESTONE_KEYS: readonly ScaleMilestoneKey[] = [
  "gold",
  "platinum",
  "harmonic_break",
];

export interface ScaleMilestone {
  key: ScaleMilestoneKey;
  label: string;
  /** Weapons with the camo, capped at the required amount. */
  completedWeapons: number;
  requiredWeapons: number;
  percent: number;
  isComplete: boolean;
  /** Account camo unlocked when the milestone is complete. */
  reward: string | null;
}

export type MilestoneFocus =
  { stage: "scale"; milestones: ScaleMilestone[] } | { stage: "mastery"; divergenceUnlocked: true };

export function toPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.floor((done / total) * 100));
}

export function getScaleMilestone(
  key: ScaleMilestoneKey,
  completed: CompletedCamos,
  weaponIds: readonly string[],
): ScaleMilestone {
  const weaponsWithCamo = weaponIds.filter((id) => isCamoCompleted(completed, id, key)).length;
  const completedWeapons = Math.min(weaponsWithCamo, REQUIRED_WEAPON_COUNT);

  return {
    key,
    label: CAMO_TIER_LABELS[key],
    completedWeapons,
    requiredWeapons: REQUIRED_WEAPON_COUNT,
    percent: toPercent(completedWeapons, REQUIRED_WEAPON_COUNT),
    isComplete: completedWeapons >= REQUIRED_WEAPON_COUNT,
    reward: key === "harmonic_break" ? "Divergência" : null,
  };
}

/** Divergence is earned with Dissonância on 33 weapons, so it is derived, never stored. */
export function isDivergenceUnlocked(
  completed: CompletedCamos,
  weaponIds: readonly string[],
): boolean {
  return getScaleMilestone("harmonic_break", completed, weaponIds).isComplete;
}

/**
 * What the dashboard highlights. Always the next unfinished milestone:
 * - Ouro unfinished → Ouro and Platina side by side;
 * - then Platina, then Dissonância (which unlocks Divergência);
 * - after Divergência → the mastery camos of each mode.
 */
export function getMilestoneFocus(
  completed: CompletedCamos,
  weaponIds: readonly string[],
): MilestoneFocus {
  const [gold, platinum, harmonicBreak] = SCALE_MILESTONE_KEYS.map((key) =>
    getScaleMilestone(key, completed, weaponIds),
  ) as [ScaleMilestone, ScaleMilestone, ScaleMilestone];

  if (!gold.isComplete) return { stage: "scale", milestones: [gold, platinum] };
  if (!platinum.isComplete) return { stage: "scale", milestones: [platinum] };
  if (!harmonicBreak.isComplete) return { stage: "scale", milestones: [harmonicBreak] };
  return { stage: "mastery", divergenceUnlocked: true };
}
