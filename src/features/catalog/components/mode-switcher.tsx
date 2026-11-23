import Link from "next/link";

import { weaponRoute } from "@/constants/routes";
import { cn } from "@/lib/utils/cn";

import { type GameMode } from "../types/catalog.types";

interface ModeSwitcherProps {
  weaponId: string;
  modes: readonly GameMode[];
  activeModeId: string;
}

/**
 * Each mode is its own URL, so switching really loads that mode's requirements and
 * works with the browser history and shared links.
 */
export function ModeSwitcher({ weaponId, modes, activeModeId }: ModeSwitcherProps) {
  return (
    <nav aria-label="Modo de jogo" className="grid grid-cols-3 gap-1 rounded-md border bg-card p-1">
      {modes.map((mode) => {
        const active = mode.id === activeModeId;
        return (
          <Link
            key={mode.id}
            href={weaponRoute(weaponId, mode.id)}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center rounded-[3px] px-3 py-1 transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span className="font-display-caps text-base leading-none font-extrabold">
              {mode.shortName}
            </span>
            <span className="text-[11px] leading-tight opacity-80">{mode.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
