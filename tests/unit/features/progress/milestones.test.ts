import { describe, expect, it } from "vitest";

import { type WeaponCamoSlot } from "@/features/progress/domain/camo-slots";
import { toCamoKey } from "@/features/progress/domain/completed-camos";
import {
  getMilestoneFocus,
  getScaleMilestone,
  isDivergenceUnlocked,
  REQUIRED_WEAPON_COUNT,
} from "@/features/progress/domain/milestones";

// 33 launch weapons + 4 Season 1 weapons, as in the real catalog.
const WEAPONS = Array.from({ length: 37 }, (_, index) => `weapon-${index + 1}`);

function withCamo(slots: readonly WeaponCamoSlot[], weaponCount: number): Set<string> {
  return new Set(
    WEAPONS.slice(0, weaponCount).flatMap((id) => slots.map((slot) => toCamoKey(id, slot))),
  );
}

describe("getScaleMilestone", () => {
  it("counts weapons with the camo against the 33 required", () => {
    const milestone = getScaleMilestone("gold", withCamo(["gold"], 12), WEAPONS);

    expect(milestone).toMatchObject({
      label: "Ouro",
      completedWeapons: 12,
      requiredWeapons: REQUIRED_WEAPON_COUNT,
      percent: 36,
      isComplete: false,
    });
  });

  it("counts any weapon, including Season 1, and caps at 33", () => {
    const allButFourLaunch = new Set(
      WEAPONS.slice(4).map((id) => toCamoKey(id, "gold")), // skips 4, uses the 4 Season 1
    );
    expect(getScaleMilestone("gold", allButFourLaunch, WEAPONS)).toMatchObject({
      completedWeapons: 33,
      isComplete: true,
    });

    expect(getScaleMilestone("gold", withCamo(["gold"], 37), WEAPONS).completedWeapons).toBe(33);
  });

  it("ignores camos of weapons that are not in the catalog", () => {
    const milestone = getScaleMilestone("gold", new Set([toCamoKey("ghost", "gold")]), WEAPONS);
    expect(milestone.completedWeapons).toBe(0);
  });

  it("announces Divergência as the Dissonância reward", () => {
    expect(getScaleMilestone("harmonic_break", new Set(), WEAPONS).reward).toBe("Divergência");
    expect(getScaleMilestone("gold", new Set(), WEAPONS).reward).toBeNull();
  });
});

describe("getMilestoneFocus", () => {
  it("shows Ouro and Platina side by side while Ouro is unfinished", () => {
    const focus = getMilestoneFocus(withCamo(["gold", "platinum"], 5), WEAPONS);

    expect(focus.stage).toBe("scale");
    if (focus.stage !== "scale") return;
    expect(focus.milestones.map((m) => [m.key, m.completedWeapons])).toEqual([
      ["gold", 5],
      ["platinum", 5],
    ]);
  });

  it("advances automatically to Platina, then Dissonância", () => {
    const platinumFocus = getMilestoneFocus(withCamo(["gold"], 33), WEAPONS);
    expect(platinumFocus.stage === "scale" && platinumFocus.milestones.map((m) => m.key)).toEqual([
      "platinum",
    ]);

    const harmonicFocus = getMilestoneFocus(withCamo(["gold", "platinum"], 33), WEAPONS);
    expect(harmonicFocus.stage === "scale" && harmonicFocus.milestones.map((m) => m.key)).toEqual([
      "harmonic_break",
    ]);
  });

  it("moves to masteries once Divergência is unlocked", () => {
    const completed = withCamo(["gold", "platinum", "harmonic_break"], 33);

    expect(isDivergenceUnlocked(completed, WEAPONS)).toBe(true);
    expect(getMilestoneFocus(completed, WEAPONS)).toEqual({
      stage: "mastery",
      divergenceUnlocked: true,
    });
  });

  it("goes back to an earlier milestone when a camo is unmarked", () => {
    const completed = withCamo(["gold", "platinum"], 33);
    completed.delete(toCamoKey("weapon-1", "gold"));

    const focus = getMilestoneFocus(completed, WEAPONS);
    expect(focus.stage === "scale" && focus.milestones[0]?.key).toBe("gold");
  });
});
