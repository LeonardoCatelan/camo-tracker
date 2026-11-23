import { SegmentedProgress } from "@/components/shared/segmented-progress";
import { CamoIcon } from "@/features/camos/components/camo-icon";
import { cn } from "@/lib/utils/cn";

import { type ScaleMilestone } from "../domain/milestones";

interface MilestoneCardProps {
  milestone: ScaleMilestone;
  /** Operation code shown in the header, e.g. "OP-01". */
  code: string;
  eyebrow: string;
  /** The main objective gets the amber frame; parallel ones stay neutral. */
  primary?: boolean;
}

/** Large-scale milestone: one camo on 33 weapons, with a cell per weapon. */
export function MilestoneCard({ milestone, code, eyebrow, primary = false }: MilestoneCardProps) {
  const remaining = milestone.requiredWeapons - milestone.completedWeapons;

  return (
    <section
      aria-label={`Marco ${milestone.label}`}
      className={cn(
        "flex flex-col gap-4 rounded-md border bg-card hud-corners p-5 sm:p-6",
        primary && "border-highlight/50 [--corner-color:var(--highlight)]",
      )}
    >
      <p className="font-hud text-xs tracking-widest text-muted-foreground uppercase">
        {code} <span className="text-highlight-ink">{"//"}</span> {eyebrow}
      </p>

      <div className="flex items-center gap-4">
        <CamoIcon
          name={milestone.label}
          variant={milestone.key}
          className={cn("size-14 ring-1 ring-border", primary && "sm:size-16")}
        />
        <div className="min-w-0 flex-1">
          <h2
            className={cn(
              "font-display-caps leading-none font-extrabold",
              primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
            )}
          >
            {milestone.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {milestone.label} em {milestone.requiredWeapons} armas
          </p>
        </div>
        <p className="text-right font-hud leading-none">
          <span className={cn("text-highlight-ink", primary ? "text-5xl" : "text-4xl")}>
            {milestone.completedWeapons}
          </span>
          <span className="text-xl text-muted-foreground">/{milestone.requiredWeapons}</span>
          <span className="mt-1 block text-[11px] tracking-widest text-muted-foreground uppercase">
            armas
          </span>
        </p>
      </div>

      <SegmentedProgress
        value={milestone.completedWeapons}
        max={milestone.requiredWeapons}
        label={`Progresso de ${milestone.label}`}
        className={primary ? "h-4" : "h-3"}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 font-hud text-sm">
        <span>
          <span className="text-highlight-ink">{milestone.percent}%</span>
          <span className="text-muted-foreground"> concluído</span>
        </span>
        <span className="text-muted-foreground">
          {milestone.isComplete
            ? "Marco concluído"
            : `Faltam ${remaining} ${remaining === 1 ? "arma" : "armas"}`}
          {milestone.reward && (
            <>
              {" · Recompensa: "}
              <span className="text-foreground">{milestone.reward}</span>
            </>
          )}
        </span>
      </div>
    </section>
  );
}
