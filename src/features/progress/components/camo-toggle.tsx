"use client";

import { Check } from "lucide-react";
import { type ReactNode } from "react";

import { CamoIcon } from "@/features/camos/components/camo-icon";
import { cn } from "@/lib/utils/cn";

import { type WeaponCamoSlot } from "../domain/camo-slots";
import { getSlotIcon } from "../lib/slot-icon";

import { useCamoProgress } from "./camo-progress-provider";

interface CamoToggleProps {
  weaponId: string;
  slot: WeaponCamoSlot;
  /** Name shown to the user (real camo name, or "Ouro", "Militar 3"...). */
  name: string;
  /** Extra context for screen readers, e.g. the weapon name. */
  context?: string;
  /**
   * - `tile`: compact square for lists (icon + name);
   * - `row`: full-width card with details (weapon page).
   */
  layout?: "tile" | "row";
  /** Hides the visible name in the `tile` layout (it stays as the accessible name). */
  hideName?: boolean;
  /** Details shown in the `row` layout (requirements of the selected mode). */
  children?: ReactNode;
  className?: string;
}

function CheckBadge({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 items-center justify-center rounded-[3px] border-2 transition-colors",
        checked
          ? "border-highlight bg-highlight text-highlight-foreground"
          : "border-muted-foreground/50 bg-background/70",
        className,
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3.5} />}
    </span>
  );
}

/**
 * The whole camo area is the control: tapping anywhere toggles completion
 * (and the cascade through the unlock order). Built for thumbs during a match.
 */
export function CamoToggle({
  weaponId,
  slot,
  name,
  context,
  layout = "tile",
  hideName = false,
  children,
  className,
}: CamoToggleProps) {
  const { isCompleted, toggle } = useCamoProgress();
  const checked = isCompleted(weaponId, slot);
  const icon = getSlotIcon(slot);
  const accessibleName = context ? `${name} — ${context}` : name;

  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={accessibleName}
      title={name}
      onClick={() => toggle(weaponId, slot)}
      className={cn(
        "group relative cursor-pointer border text-left transition-[color,background-color,border-color,transform] outline-none select-none active:scale-[0.97]",
        "focus-visible:ring-[3px] focus-visible:ring-ring/60",
        checked
          ? "border-highlight/80 bg-highlight/10"
          : "border-border bg-card hover:border-olive hover:bg-accent/40",
        layout === "tile"
          ? "flex w-[4.75rem] flex-col items-center gap-1.5 rounded-md p-1.5 pt-2"
          : "flex w-full items-center gap-3 rounded-md p-3",
        className,
      )}
    >
      <CamoIcon
        name={name}
        variant={icon.variant}
        index={icon.index}
        className={cn(
          "transition-[filter,opacity]",
          layout === "tile" ? "size-11" : "size-12",
          !checked && "opacity-70 grayscale-[45%] group-hover:opacity-100 group-hover:grayscale-0",
        )}
      />

      {layout === "tile" ? (
        <>
          {!hideName && (
            <span
              className={cn(
                "line-clamp-2 w-full text-center text-[11px] leading-tight font-medium",
                checked ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {name}
            </span>
          )}
          <CheckBadge checked={checked} className="absolute top-1 right-1 size-4" />
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1">
            <span className="block font-display-caps text-base leading-tight font-bold">
              {name}
            </span>
            {children}
          </span>
          <CheckBadge checked={checked} className="size-6" />
        </>
      )}
    </button>
  );
}
