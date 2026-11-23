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

      {/* Phones: icon + title on the first row, counter on its own row (always the same
          shape, whatever the milestone name). From `sm` up, the counter sits on the right. */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <CamoIcon
          name={milestone.label}
          variant={milestone.key}
          className={cn("size-12 ring-1 ring-border sm:size-14", primary && "sm:size-16")}
        />
        <div className="min-w-0">
          <h2
            className={cn(
              "font-display-caps leading-none font-extrabold break-words",
              primary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
            )}
          >
            {milestone.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {milestone.label} em {milestone.requiredWeapons} armas
          </p>
        </div>
        <p className="col-span-2 flex items-baseline gap-1 font-hud leading-none sm:col-span-1 sm:block sm:text-right">
          <span className={cn("text-highlight-ink", primary ? "text-5xl" : "text-4xl")}>
            {milestone.completedWeapons}
          </span>
          <span className="text-xl text-muted-foreground">/{milestone.requiredWeapons}</span>
          <span className="ml-1 text-[11px] tracking-widest text-muted-foreground uppercase sm:mt-1 sm:ml-0 sm:block">
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

      <div className="flex flex-col gap-1 font-hud text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2">
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
