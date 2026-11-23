"use client";

import { Info } from "lucide-react";

import { SegmentedProgress } from "@/components/shared/segmented-progress";
import {
  type GameMode,
  type Weapon,
  type WeaponChallenge,
} from "@/features/catalog/types/catalog.types";

import {
  CAMO_TIER_LABELS,
  getSlotLabel,
  MILITARY_SLOTS,
  SPECIAL_SLOTS,
  WEAPON_CAMO_SLOTS,
  type WeaponCamoSlot,
} from "../domain/camo-slots";

import { useCamoProgress } from "./camo-progress-provider";
import { CamoToggle } from "./camo-toggle";

interface WeaponCamoSectionsProps {
  weapon: Weapon;
  mode: GameMode;
  /** Requirements of each camo in the selected mode. */
  challenges: Partial<Record<WeaponCamoSlot, WeaponChallenge>>;
}

const MASTERY_SLOTS: readonly WeaponCamoSlot[] = ["gold", "platinum", "harmonic_break"];

function ChallengeDetails({ challenge }: { challenge: WeaponChallenge | undefined }) {
  if (!challenge?.description) {
    return (
      <span className="mt-0.5 block text-sm text-muted-foreground italic">
        Desafio a revelar
        {challenge?.note && <span className="block text-xs not-italic">{challenge.note}</span>}
      </span>
    );
  }

  return (
    <span className="mt-0.5 block text-sm text-muted-foreground">
      {challenge.description}
      {challenge.targetAmount !== null && (
        <span className="ml-2 font-hud text-xs text-highlight-ink">×{challenge.targetAmount}</span>
      )}
      {challenge.note && (
        <span className="mt-1 flex items-start gap-1 text-xs">
          <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
          {challenge.note}
        </span>
      )}
    </span>
  );
}

function SectionHeader({ title, done, total }: { title: string; done: number; total: number }) {
  return (
    <header className="mb-2 flex items-center justify-between gap-2 border-b pb-1">
      <h2 className="tape-label">{title}</h2>
      <span className="font-hud text-xs text-muted-foreground">
        {done}/{total}
      </span>
    </header>
  );
}

/**
 * Camos of one weapon. Completion is shared by every mode (a camo is earned once);
 * the mode only changes the requirements shown for each camo.
 */
export function WeaponCamoSections({ weapon, mode, challenges }: WeaponCamoSectionsProps) {
  const { isCompleted } = useCamoProgress();
  const count = (slots: readonly WeaponCamoSlot[]) =>
    slots.filter((slot) => isCompleted(weapon.id, slot)).length;
  const totalDone = count(WEAPON_CAMO_SLOTS);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="flex justify-between font-hud text-xs tracking-widest text-muted-foreground uppercase">
          <span>Camuflagens da arma</span>
          <span>
            <span className="text-highlight-ink">{totalDone}</span>/{WEAPON_CAMO_SLOTS.length}
          </span>
        </p>
        <SegmentedProgress
          value={totalDone}
          max={WEAPON_CAMO_SLOTS.length}
          label={`Camuflagens concluídas da ${weapon.name}`}
        />
        <p className="text-xs text-muted-foreground">
          Concluir em qualquer modo vale para todos. Marcar uma camuflagem marca as anteriores;
          desmarcar limpa as seguintes.
        </p>
      </div>

      <section aria-label={CAMO_TIER_LABELS.military}>
        <SectionHeader
          title={CAMO_TIER_LABELS.military}
          done={count(MILITARY_SLOTS)}
          total={MILITARY_SLOTS.length}
        />
        <div className="flex flex-wrap gap-2">
          {MILITARY_SLOTS.map((slot) => (
            <CamoToggle
              key={slot}
              weaponId={weapon.id}
              slot={slot}
              name={getSlotLabel(slot)}
              context={weapon.name}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Liberadas pelo nível da arma. Os nomes ainda não constam nos dados.
        </p>
      </section>

      <section aria-label={CAMO_TIER_LABELS.special}>
        <SectionHeader
          title={`${CAMO_TIER_LABELS.special} · ${mode.shortName}`}
          done={count(SPECIAL_SLOTS)}
          total={SPECIAL_SLOTS.length}
        />
        <div className="grid gap-2">
          {SPECIAL_SLOTS.map((slot) => (
            <CamoToggle
              key={slot}
              layout="row"
              weaponId={weapon.id}
              slot={slot}
              name={challenges[slot]?.camoName ?? getSlotLabel(slot)}
              context={weapon.name}
            >
              <ChallengeDetails challenge={challenges[slot]} />
            </CamoToggle>
          ))}
        </div>
      </section>

      <section aria-label="Camuflagens de maestria da arma">
        <SectionHeader
          title={`Maestria da arma · ${mode.shortName}`}
          done={count(MASTERY_SLOTS)}
          total={MASTERY_SLOTS.length}
        />
        <div className="grid gap-2">
          {MASTERY_SLOTS.map((slot) => (
            <CamoToggle
              key={slot}
              layout="row"
              weaponId={weapon.id}
              slot={slot}
              name={getSlotLabel(slot)}
              context={weapon.name}
            >
              <ChallengeDetails challenge={challenges[slot]} />
            </CamoToggle>
          ))}
        </div>
      </section>
    </div>
  );
}
