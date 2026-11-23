"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { toggleWeaponCamoAction } from "../actions/progress.actions";
import { type WeaponCamoSlot } from "../domain/camo-slots";
import {
  applyCamoToggle,
  isCamoCompleted,
  type CamoToggle,
  type CompletedCamos,
} from "../domain/completed-camos";

interface CamoProgressContextValue {
  completed: CompletedCamos;
  isCompleted: (weaponId: string, slot: WeaponCamoSlot) => boolean;
  toggle: (weaponId: string, slot: WeaponCamoSlot) => void;
}

const CamoProgressContext = createContext<CamoProgressContextValue | null>(null);

interface CamoProgressProviderProps {
  /** Completed camo keys loaded on the server for the signed-in user. */
  initialCompleted: readonly string[];
  children: ReactNode;
}

/**
 * Shared, optimistic view of the user's weapon camos. A click updates every consumer
 * (tiles, milestone cards) immediately; the Server Action persists it and the server
 * refresh replaces the optimistic state. On failure the change is rolled back.
 */
export function CamoProgressProvider({ initialCompleted, children }: CamoProgressProviderProps) {
  const persisted = useMemo(() => new Set(initialCompleted), [initialCompleted]);
  const [completed, applyOptimistic] = useOptimistic<CompletedCamos, CamoToggle>(
    persisted,
    applyCamoToggle,
  );
  const [, startTransition] = useTransition();

  const toggle = useCallback(
    (weaponId: string, slot: WeaponCamoSlot) => {
      const change: CamoToggle = {
        weaponId,
        slot,
        completed: !isCamoCompleted(completed, weaponId, slot),
      };
      startTransition(async () => {
        applyOptimistic(change);
        const result = await toggleWeaponCamoAction(change);
        if (!result.success) toast.error(result.error);
      });
    },
    [completed, applyOptimistic],
  );

  const value = useMemo<CamoProgressContextValue>(
    () => ({
      completed,
      isCompleted: (weaponId, slot) => isCamoCompleted(completed, weaponId, slot),
      toggle,
    }),
    [completed, toggle],
  );

  return <CamoProgressContext value={value}>{children}</CamoProgressContext>;
}

export function useCamoProgress(): CamoProgressContextValue {
  const context = useContext(CamoProgressContext);
  if (!context) throw new Error("useCamoProgress deve ser usado dentro de <CamoProgressProvider>.");
  return context;
}
