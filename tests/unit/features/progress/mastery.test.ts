import { describe, expect, it } from "vitest";

import {
  clampMasteryProgress,
  getModeMastery,
  type MasteryChallenge,
} from "@/features/progress/domain/mastery";

function mastery(id: string, sortOrder: number, targetAmount: number | null): MasteryChallenge {
  return {
    id,
    modeId: "multiplayer",
    camoName: id,
    description: null,
    targetAmount,
    note: null,
    sortOrder,
  };
}

const CHALLENGES = [
  mastery("orion", 3, 500),
  mastery("mercurial", 1, 250),
  mastery("poly", 2, 300),
];

describe("clampMasteryProgress", () => {
  it.each([
    [-5, 250, 0],
    [12.7, 250, 12],
    [999, 250, 250],
    [Number.NaN, 250, 0],
    [40, null, 40],
  ])("clamps %s (target %s) to %s", (value, target, expected) => {
    expect(clampMasteryProgress(value, target)).toBe(expected);
  });
});

describe("getModeMastery", () => {
  it("starts at the first mastery camo, in sort order", () => {
    const result = getModeMastery(CHALLENGES, {});

    expect(result.current?.challenge.id).toBe("mercurial");
    expect(result).toMatchObject({ completedCount: 0, total: 3 });
  });

  it("advances when the target is reached and reports the percentage", () => {
    const result = getModeMastery(CHALLENGES, { mercurial: 250, poly: 150 });

    expect(result.current).toMatchObject({
      challenge: { id: "poly" },
      progress: 150,
      percent: 50,
      isComplete: false,
    });
    expect(result.completedCount).toBe(1);
  });

  it("returns no current camo when every mastery is complete", () => {
    const result = getModeMastery(CHALLENGES, { mercurial: 250, poly: 300, orion: 500 });

    expect(result.current).toBeNull();
    expect(result.completedCount).toBe(3);
  });
});
