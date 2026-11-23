import type { Metadata } from "next";
import { Suspense } from "react";

import { ROUTES } from "@/constants/routes";
import { getAllWeaponIds, getSpecialCamoNames } from "@/features/catalog/lib/catalog-queries";
import { getCatalog } from "@/features/catalog/services/catalog.service";
import { CamoBoard } from "@/features/progress/components/camo-board";
import { CamoProgressProvider } from "@/features/progress/components/camo-progress-provider";
import { MilestonePanel } from "@/features/progress/components/milestone-panel";
import { getUserProgress } from "@/features/progress/services/progress.service";

export const metadata: Metadata = { title: "Painel" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-hud text-xs tracking-widest text-muted-foreground uppercase">
          Quartel-general
        </p>
        <h1 className="font-display-caps text-3xl font-extrabold sm:text-4xl">
          Painel de operações
        </h1>
      </header>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  // The user check runs first: it marks the render as request-time, so the catalog
  // query never runs while prerendering.
  const progress = await getUserProgress(ROUTES.home);
  const catalog = await getCatalog();

  return (
    <CamoProgressProvider initialCompleted={progress.completedCamos}>
      <div className="flex flex-col gap-10">
        <MilestonePanel
          weaponIds={getAllWeaponIds(catalog)}
          modes={catalog.modes}
          masteries={catalog.masteries}
          masteryProgress={progress.masteryProgress}
        />
        <section aria-labelledby="arsenal-title" className="flex flex-col gap-4">
          <h2 id="arsenal-title" className="font-display-caps text-2xl font-extrabold">
            Arsenal
          </h2>
          <CamoBoard categories={catalog.categories} specialNames={getSpecialCamoNames(catalog)} />
        </section>
      </div>
    </CamoProgressProvider>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-busy aria-label="Carregando progresso">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-52 animate-pulse rounded-md border bg-card" />
        <div className="h-52 animate-pulse rounded-md border bg-card" />
      </div>
      <div className="h-96 animate-pulse rounded-md border bg-card" />
    </div>
  );
}
