import { cn } from "@/lib/utils/cn";

interface SegmentedProgressProps {
  value: number;
  max: number;
  /** Number of visual cells; defaults to one per unit (e.g. 33 weapons). */
  segments?: number;
  label: string;
  className?: string;
}

/** Tactical progress bar made of cells, with full progressbar semantics. */
export function SegmentedProgress({
  value,
  max,
  segments = max,
  label,
  className,
}: SegmentedProgressProps) {
  const safeMax = Math.max(max, 1);
  const filled = Math.round((Math.min(value, safeMax) / safeMax) * segments);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("flex h-3 gap-[2px]", className)}
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          key={index}
          className={cn(
            "flex-1 rounded-[1px] transition-colors",
            index < filled ? "bg-highlight" : "bg-muted ring-1 ring-border/60 ring-inset",
          )}
        />
      ))}
    </div>
  );
}
