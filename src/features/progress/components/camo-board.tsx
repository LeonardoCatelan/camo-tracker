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
        "inline-flex min-h-11 min-w-0 items-center gap-1 font-display-caps text-base font-bold break-words hover:text-highlight-ink focus-visible:text-highlight-ink focus-visible:outline-none",
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
      {/* Sticks below the site header, so switching tabs never requires scrolling up. */}
      <div className="sticky top-(--header-height) z-30 -mx-4 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:px-0">
        <TabsList className="grid h-auto! w-full grid-cols-4 gap-1 rounded-md border bg-card p-1 sm:inline-flex sm:w-fit">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="min-h-11 min-w-0 px-1 font-display-caps text-xs font-bold tracking-wide sm:flex-none sm:px-4 sm:text-sm sm:tracking-wider data-active:bg-primary! data-active:text-primary-foreground!"
            >
              {CAMO_TIER_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

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
                      // Same structure for every weapon: name on top and camos in a
                      // full-width row on phones; side by side from `sm` up.
                      <li
                        key={weapon.id}
                        className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <WeaponLink weapon={weapon} />
                          <SeasonBadge weapon={weapon} />
                        </span>
                        <span className="grid grid-cols-3 gap-2 sm:flex">
                          {SPECIAL_SLOTS.map((slot) => (
                            <CamoToggle
                              key={slot}
                              weaponId={weapon.id}
                              slot={slot}
                              name={specialNames[weapon.id]?.[slot] ?? getSlotLabel(slot)}
                              context={weapon.name}
                              className="w-full sm:w-[4.75rem]"
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
                        className="flex min-h-16 items-center gap-2 rounded-md border bg-card/60 p-1.5 pr-1"
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
