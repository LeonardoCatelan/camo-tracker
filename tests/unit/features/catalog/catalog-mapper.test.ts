import { describe, expect, it } from "vitest";

import { mapCatalog, type CatalogRows } from "@/features/catalog/lib/catalog-mapper";
import { type Tables } from "@/types/database.types";

function weapon(
  id: string,
  categoryId: string,
  sortOrder: number,
  unlockLevel: number | null,
): Tables<"weapons"> {
  return {
    id,
    name: id,
    category_id: categoryId,
    available_since: unlockLevel === null ? "Temporada 1" : null,
    unlock_level: unlockLevel,
    sort_order: sortOrder,
  };
}

function rows(weapons: Tables<"weapons">[]): CatalogRows {
  return {
    modes: [],
    categories: [
      { id: "smg", name: "Submetralhadoras", sort_order: 2 },
      { id: "ar", name: "Fuzis de Assalto", sort_order: 1 },
    ],
    weapons,
    challenges: [],
  };
}

describe("mapCatalog weapon order", () => {
  it("sorts by category first, then by unlock level", () => {
    const catalog = mapCatalog(
      rows([
        weapon("axion", "ar", 1, 52),
        weapon("han-86", "ar", 2, 4),
        weapon("m4", "ar", 3, 14),
        weapon("vel-46", "smg", 1, 5),
        weapon("iso", "smg", 2, 4),
      ]),
    );

    expect(catalog.categories.map((c) => [c.id, c.weapons.map((w) => w.id)])).toEqual([
      ["ar", ["han-86", "m4", "axion"]],
      ["smg", ["iso", "vel-46"]],
    ]);
  });

  it("puts weapons without a known level last and keeps catalog order on ties", () => {
    const catalog = mapCatalog(
      rows([
        weapon("osprey", "ar", 1, null),
        weapon("b", "ar", 3, 4),
        weapon("a", "ar", 2, 4),
        weapon("squall", "ar", 4, 55),
      ]),
    );

    expect(catalog.categories[0]?.weapons.map((w) => w.id)).toEqual(["a", "b", "squall", "osprey"]);
    expect(catalog.categories[0]?.weapons[3]?.unlockLevel).toBeNull();
  });
});
