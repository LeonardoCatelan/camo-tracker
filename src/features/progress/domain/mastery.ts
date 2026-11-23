import { toPercent } from "./milestones";

export interface MasteryChallenge {
  id: string;
  modeId: string;
  camoName: string | null;
  description: string | null;
  targetAmount: number | null;
  note: string | null;
  sortOrder: number;
}

export interface MasteryStatus {
  challenge: MasteryChallenge;
  progress: number;
  percent: number;
  isComplete: boolean;
}

export interface ModeMastery {
  /** First mastery camo not yet completed; `null` when every one is done. */
  current: MasteryStatus | null;
  completedCount: number;
  total: number;
}

/** Keeps manual input inside `[0, target]`, as an integer. */
export function clampMasteryProgress(value: number, targetAmount: number | null): number {
  if (!Number.isFinite(value)) return 0;
  const integer = Math.max(0, Math.trunc(value));
  return targetAmount === null ? integer : Math.min(integer, targetAmount);
}

export function getMasteryStatus(challenge: MasteryChallenge, progress: number): MasteryStatus {
  const value = clampMasteryProgress(progress, challenge.targetAmount);
  const target = challenge.targetAmount;
  return {
    challenge,
    progress: value,
    percent: target === null ? 0 : toPercent(value, target),
    isComplete: target !== null && value >= target,
  };
}

/** Mastery camos of a mode are earned in order; the current one is the first unfinished. */
export function getModeMastery(
  challenges: readonly MasteryChallenge[],
  progressById: Readonly<Record<string, number>>,
): ModeMastery {
  const statuses = [...challenges]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((challenge) => getMasteryStatus(challenge, progressById[challenge.id] ?? 0));

  return {
    current: statuses.find((status) => !status.isComplete) ?? null,
    completedCount: statuses.filter((status) => status.isComplete).length,
    total: statuses.length,
  };
}
