"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { weaponRoute } from "@/constants/routes";
import { type SpecialCamoNames } from "@/features/catalog/lib/catalog-queries";
import { type Weapon, type WeaponCategory } from "@/features/catalog/types/catalog.types";
import { cn } from "@/lib/utils/cn";

import {
  CAMO_TIER_LABELS,
  getSlotLabel,
  SPECIAL_SLOTS,
  type WeaponCamoSlot,
} from "../domain/camo-slots";

import { useCamoProgress } from "./camo-progress-provider";
import { CamoToggle } from "./camo-toggle";

type BoardTab = "special" | "gold" | "platinum" | "harmonic_break";

const TABS: readonly BoardTab[] = ["special", "gold", "platinum", "harmonic_break"];

interface CamoBoardProps {
  categories: readonly WeaponCategory[];
  specialNames: SpecialCamoNames;
}

function SeasonBadge({ weapon }: { weapon: Weapon }) {
  if (!weapon.availableSince) return null;
  return (
    <span
      title={`Disponível desde: ${weapon.availableSince}`}
      className="rounded-[2px] border border-olive/60 px-1 font-hud text-[10px] leading-4 text-olive"
    >
      {weapon.availableSince.replace("Temporada ", "T")}
    </span>
  );
}

function WeaponLink({ weapon, className }: { weapon: Weapon; className?: string }) {
  return (
    <Link
      href={weaponRoute(weapon.id)}
      className={cn(
        "inline-flex min-h-11 items-center gap-1 font-display-caps text-base font-bold hover:text-highlight-ink focus-visible:text-highlight-ink focus-visible:outline-none",
        className,
      )}
    >
      {weapon.name}
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}

/**
 * Weapons grouped by category, one tab per camo family. Clicking a camo toggles it
 * right here; the weapon name opens its own page.
 */
export function CamoBoard({ categories, specialNames }: CamoBoardProps) {
  const { isCompleted } = useCamoProgress();

  function countDone(weapons: readonly Weapon[], slots: readonly WeaponCamoSlot[]) {
    return weapons.reduce(
      (total, weapon) => total + slots.filter((slot) => isCompleted(weapon.id, slot)).length,
      0,
    );
  }

  return (
    <Tabs defaultValue="special" className="gap-4">
      <TabsList className="h-auto! w-full flex-wrap justify-start gap-1 rounded-md border bg-card p-1 sm:w-fit">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="min-h-10 flex-none px-4 font-display-caps text-sm font-bold tracking-wider data-active:bg-primary! data-active:text-primary-foreground!"
          >
            {CAMO_TIER_LABELS[tab]}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const slots: readonly WeaponCamoSlot[] = tab === "special" ? SPECIAL_SLOTS : [tab];
        return (
          <TabsContent key={tab} value={tab} className="flex flex-col gap-6">
            {categories.map((category) => (
              <section key={category.id} aria-labelledby={`${tab}-${category.id}`}>
                <header className="mb-2 flex items-center justify-between gap-2 border-b pb-1">
                  <h3 id={`${tab}-${category.id}`} className="tape-label">
                    {category.name}
                  </h3>
                  <span className="font-hud text-xs text-muted-foreground">
                    {countDone(category.weapons, slots)}/{category.weapons.length * slots.length}
                  </span>
                </header>

                {tab === "special" ? (
                  <ul className="divide-y divide-border/60">
                    {category.weapons.map((weapon) => (
                      <li
                        key={weapon.id}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2"
                      >
                        <span className="flex items-center gap-2">
                          <WeaponLink weapon={weapon} />
                          <SeasonBadge weapon={weapon} />
                        </span>
                        <span className="flex gap-2">
                          {SPECIAL_SLOTS.map((slot) => (
                            <CamoToggle
                              key={slot}
                              weaponId={weapon.id}
                              slot={slot}
                              name={specialNames[weapon.id]?.[slot] ?? getSlotLabel(slot)}
                              context={weapon.name}
                            />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2">
                    {category.weapons.map((weapon) => (
                      <li
                        key={weapon.id}
                        className="flex items-center gap-2 rounded-md border bg-card/60 p-1.5 pr-0"
                      >
                        <CamoToggle
                          weaponId={weapon.id}
                          slot={tab}
                          name={CAMO_TIER_LABELS[tab]}
                          context={weapon.name}
                          hideName
                          className="w-14 shrink-0 p-1"
                        />
                        <span className="flex min-w-0 flex-col">
                          <WeaponLink weapon={weapon} className="min-h-0 text-sm leading-tight" />
                          <SeasonBadge weapon={weapon} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
