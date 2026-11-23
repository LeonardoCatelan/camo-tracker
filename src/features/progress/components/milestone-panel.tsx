"use client";

import { useMemo } from "react";

import { CamoIcon } from "@/features/camos/components/camo-icon";
import { type GameMode } from "@/features/catalog/types/catalog.types";

import { getModeMastery, type MasteryChallenge } from "../domain/mastery";
import { getMilestoneFocus } from "../domain/milestones";

import { useCamoProgress } from "./camo-progress-provider";
import { MasteryCard } from "./mastery-card";
import { MilestoneCard } from "./milestone-card";

interface MilestonePanelProps {
  weaponIds: readonly string[];
  modes: readonly GameMode[];
  masteries: readonly MasteryChallenge[];
  masteryProgress: Readonly<Record<string, number>>;
}

const OPERATION_CODES = { gold: "OP-01", platinum: "OP-02", harmonic_break: "OP-03" } as const;

/**
 * Always shows the next unfinished large-scale milestone, derived from the user's
 * completed camos (nothing is stored). It reacts instantly to optimistic toggles.
 */
export function MilestonePanel({
  weaponIds,
  modes,
  masteries,
  masteryProgress,
}: MilestonePanelProps) {
  const { completed } = useCamoProgress();
  const focus = useMemo(() => getMilestoneFocus(completed, weaponIds), [completed, weaponIds]);

  if (focus.stage === "scale") {
    const [main, parallel] = focus.milestones;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {main && (
          <MilestoneCard
            milestone={main}
            code={OPERATION_CODES[main.key]}
            eyebrow="Objetivo atual"
            primary
          />
        )}
        {parallel && (
          <MilestoneCard
            milestone={parallel}
            code={OPERATION_CODES[parallel.key]}
            eyebrow="Em paralelo"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex items-center gap-4 rounded-md border border-highlight/50 bg-card hud-corners p-4 [--corner-color:var(--highlight)]">
        <CamoIcon name="Divergência" variant="divergence" className="size-12" />
        <div>
          <p className="font-hud text-xs tracking-widest text-muted-foreground uppercase">
            Camuflagem de conta desbloqueada
          </p>
          <h2 className="font-display-caps text-2xl font-extrabold">Divergência</h2>
          <p className="text-sm text-muted-foreground">
            Dissonância concluída em 33 armas. Agora, rumo às maestrias de cada modo.
          </p>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <MasteryCard
            key={mode.id}
            mode={mode}
            mastery={getModeMastery(
              masteries.filter((item) => item.modeId === mode.id),
              masteryProgress,
            )}
          />
        ))}
      </div>
    </div>
  );
}
