import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ROUTES, weaponRoute } from "@/constants/routes";
import { ModeSwitcher } from "@/features/catalog/components/mode-switcher";
import {
  DEFAULT_MODE_ID,
  findMode,
  findWeapon,
  getWeaponChallenges,
} from "@/features/catalog/lib/catalog-queries";
import { getCatalog } from "@/features/catalog/services/catalog.service";
import { CamoProgressProvider } from "@/features/progress/components/camo-progress-provider";
import { WeaponCamoSections } from "@/features/progress/components/weapon-camo-sections";
import { getUserProgress } from "@/features/progress/services/progress.service";

export const metadata: Metadata = { title: "Arma" };

interface WeaponPageProps {
  /** `/weapons/axion` (default mode) or `/weapons/axion/dmz`. */
  params: Promise<{ weaponId: string; mode?: string[] }>;
}

export default function WeaponPage({ params }: WeaponPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={ROUTES.home}
        className="inline-flex min-h-11 w-fit items-center gap-1 font-hud text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Voltar ao painel
      </Link>
      {/* Params are request data: they are read inside the boundary. */}
      <Suspense fallback={<WeaponSkeleton />}>
        {params.then(({ weaponId, mode }) => (
          <WeaponContent weaponId={weaponId} modeSegments={mode} />
        ))}
      </Suspense>
    </div>
  );
}

async function WeaponContent({
  weaponId,
  modeSegments = [],
}: {
  weaponId: string;
  modeSegments?: string[];
}) {
  const progress = await getUserProgress(weaponRoute(weaponId, modeSegments[0]));
  const catalog = await getCatalog();

  const found = findWeapon(catalog, weaponId);
  const mode = findMode(catalog, modeSegments[0] ?? DEFAULT_MODE_ID);
  if (!found || !mode || modeSegments.length > 1) notFound();

  const { weapon, category } = found;

  return (
    <CamoProgressProvider initialCompleted={progress.completedCamos}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="tape-label w-fit">{category.name}</p>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-display-caps text-4xl font-extrabold sm:text-5xl">{weapon.name}</h1>
            {weapon.availableSince && (
              <span className="rounded-[2px] border border-olive/60 px-1.5 font-hud text-xs text-olive">
                {weapon.availableSince}
              </span>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-2">
          <ModeSwitcher weaponId={weapon.id} modes={catalog.modes} activeModeId={mode.id} />
          {mode.targetDescription && (
            <p className="text-sm text-muted-foreground">
              <span className="font-hud text-xs tracking-widest uppercase">
                Alvos no {mode.shortName}:
              </span>{" "}
              {mode.targetDescription}
            </p>
          )}
        </div>

        <WeaponCamoSections
          weapon={weapon}
          mode={mode}
          challenges={getWeaponChallenges(catalog, weapon.id, mode.id)}
        />
      </div>
    </CamoProgressProvider>
  );
}

function WeaponSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Carregando arma">
      <div className="h-16 w-64 animate-pulse rounded-md bg-card" />
      <div className="h-14 animate-pulse rounded-md border bg-card" />
      <div className="h-80 animate-pulse rounded-md border bg-card" />
    </div>
  );
}
