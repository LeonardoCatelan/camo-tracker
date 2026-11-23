import { describe, expect, it } from "vitest";

import {
  getDependentSlots,
  getPrerequisiteSlots,
  getSlotsAffectedByToggle,
} from "@/features/progress/domain/camo-cascade";
import { MILITARY_SLOTS, SPECIAL_SLOTS } from "@/features/progress/domain/camo-slots";
import { applyCamoToggle, toCamoKey } from "@/features/progress/domain/completed-camos";

describe("getPrerequisiteSlots", () => {
  it("has nothing before the first military camo", () => {
    expect(getPrerequisiteSlots("military_1")).toEqual([]);
  });

  it("requires the previous military camos, in sequence", () => {
    expect(getPrerequisiteSlots("military_4")).toEqual(["military_1", "military_2", "military_3"]);
  });

  it("requires every military camo for a special, but not the other specials", () => {
    expect(getPrerequisiteSlots("special_2")).toEqual(MILITARY_SLOTS);
  });

  it("requires militaries and all specials for Ouro", () => {
    expect(getPrerequisiteSlots("gold")).toEqual([...MILITARY_SLOTS, ...SPECIAL_SLOTS]);
  });

  it("requires everything before Dissonância", () => {
    expect(getPrerequisiteSlots("harmonic_break")).toEqual([
      ...MILITARY_SLOTS,
      ...SPECIAL_SLOTS,
      "gold",
      "platinum",
    ]);
  });
});

describe("getDependentSlots", () => {
  it("clears everything after the first military camo", () => {
    expect(getDependentSlots("military_1")).toEqual([
      ...MILITARY_SLOTS.slice(1),
      ...SPECIAL_SLOTS,
      "gold",
      "platinum",
      "harmonic_break",
    ]);
  });

  it("does not clear sibling specials", () => {
    expect(getDependentSlots("special_1")).toEqual(["gold", "platinum", "harmonic_break"]);
  });

  it("has nothing after Dissonância", () => {
    expect(getDependentSlots("harmonic_break")).toEqual([]);
  });
});

describe("getSlotsAffectedByToggle", () => {
  it("includes the toggled camo first", () => {
    expect(getSlotsAffectedByToggle("platinum", false)).toEqual(["platinum", "harmonic_break"]);
  });
});

describe("applyCamoToggle", () => {
  it("completing Ouro marks every earlier camo of that weapon only", () => {
    const next = applyCamoToggle(new Set(), { weaponId: "axion", slot: "gold", completed: true });

    expect(next.size).toBe(MILITARY_SLOTS.length + SPECIAL_SLOTS.length + 1);
    expect(next.has(toCamoKey("axion", "military_1"))).toBe(true);
    expect(next.has(toCamoKey("axion", "special_3"))).toBe(true);
    expect(next.has(toCamoKey("axion", "platinum"))).toBe(false);
  });

  it("un-completing the first military camo clears the whole weapon and keeps others", () => {
    const start = applyCamoToggle(new Set([toCamoKey("kogot", "gold")]), {
      weaponId: "axion",
      slot: "harmonic_break",
      completed: true,
    });

    const next = applyCamoToggle(start, {
      weaponId: "axion",
      slot: "military_1",
      completed: false,
    });

    expect([...next]).toEqual([toCamoKey("kogot", "gold")]);
  });

  it("does not mutate the input set", () => {
    const start = new Set<string>();
    applyCamoToggle(start, { weaponId: "axion", slot: "gold", completed: true });
    expect(start.size).toBe(0);
  });
});
