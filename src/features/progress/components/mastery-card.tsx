"use client";

import { CheckCheck, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { SegmentedProgress } from "@/components/shared/segmented-progress";
import { Button } from "@/components/ui/button";
import { CamoIcon } from "@/features/camos/components/camo-icon";
import { type GameMode } from "@/features/catalog/types/catalog.types";
import { cn } from "@/lib/utils/cn";

import { setMasteryProgressAction } from "../actions/progress.actions";
import { clampMasteryProgress, getMasteryStatus, type ModeMastery } from "../domain/mastery";

const SAVE_DELAY_MS = 600;

interface MasteryCardProps {
  mode: GameMode;
  mastery: ModeMastery;
}

/** Mastery camos are a running count of matches, so progress is edited by hand. */
export function MasteryCard({ mode, mastery }: MasteryCardProps) {
  const { current } = mastery;

  return (
    <section
      aria-label={`Maestria ${mode.name}`}
      className="flex flex-col gap-3 rounded-md border bg-card hud-corners p-4"
    >
      <p className="flex items-center justify-between font-hud text-xs tracking-widest text-muted-foreground uppercase">
        <span>
          {mode.shortName} <span className="text-highlight-ink">{"//"}</span> Maestria
        </span>
        <span>
          {mastery.completedCount}/{mastery.total}
        </span>
      </p>

      {current ? (
        <MasteryEditor key={current.challenge.id} status={current} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <CheckCheck className="size-8 text-highlight-ink" aria-hidden />
          <p className="font-display-caps text-lg font-bold">Maestria completa</p>
          <p className="text-sm text-muted-foreground">
            Todas as camuflagens de maestria do {mode.name} foram concluídas.
          </p>
        </div>
      )}
    </section>
  );
}

function MasteryEditor({ status }: { status: ReturnType<typeof getMasteryStatus> }) {
  const { challenge } = status;
  const target = challenge.targetAmount;
  const name = challenge.camoName ?? "Maestria";

  const [value, setValue] = useState(status.progress);
  const savedValue = useRef(status.progress);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, startTransition] = useTransition();

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  function save(next: number) {
    startTransition(async () => {
      const result = await setMasteryProgressAction({ challengeId: challenge.id, progress: next });
      if (result.success) {
        savedValue.current = next;
      } else {
        toast.error(result.error);
        setValue(savedValue.current);
      }
    });
  }

  function update(next: number) {
    const clamped = clampMasteryProgress(next, target);
    setValue(clamped);
    if (timer.current) clearTimeout(timer.current);
    // Debounced: tapping +1 several times in a row results in a single save.
    timer.current = setTimeout(() => {
      if (clamped !== savedValue.current) save(clamped);
    }, SAVE_DELAY_MS);
  }

  const live = getMasteryStatus(challenge, value);

  return (
    <>
      <div className="flex items-center gap-3">
        <CamoIcon name={name} className="size-12 ring-1 ring-border" />
        <div className="min-w-0">
          <h3 className="font-display-caps text-xl leading-tight font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
      </div>

      <SegmentedProgress
        value={value}
        max={target ?? Math.max(value, 1)}
        segments={20}
        label={`Progresso de ${name}`}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-11"
          aria-label="Diminuir 1"
          disabled={value <= 0}
          onClick={() => update(value - 1)}
        >
          <Minus />
        </Button>
        <label className="flex flex-1 items-baseline justify-center gap-1 font-hud">
          <span className="sr-only">Progresso atual de {name}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={target ?? undefined}
            value={value}
            onChange={(event) => update(event.target.valueAsNumber)}
            className={cn(
              "w-20 rounded-md border bg-background px-2 py-1 text-center text-2xl text-highlight-ink",
              "[appearance:textfield] focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none",
              "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            )}
          />
          {target !== null && <span className="text-lg text-muted-foreground">/{target}</span>}
        </label>
        <Button
          type="button"
          size="icon-lg"
          className="size-11"
          aria-label="Aumentar 1"
          disabled={target !== null && value >= target}
          onClick={() => update(value + 1)}
        >
          <Plus />
        </Button>
      </div>

      <p className="flex justify-between font-hud text-xs text-muted-foreground" aria-live="polite">
        <span>{live.percent}% concluído</span>
        <span>
          {isSaving ? "Salvando…" : live.isComplete ? "Concluída!" : "Salvo automaticamente"}
        </span>
      </p>
    </>
  );
}
