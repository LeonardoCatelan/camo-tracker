import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { requireUser } from "@/features/auth/services/session.service";

export const metadata: Metadata = { title: "Painel" };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
      <Suspense fallback={<div className="h-28 animate-pulse rounded-xl bg-muted" />}>
        <WelcomeCard />
      </Suspense>
    </div>
  );
}

async function WelcomeCard() {
  // Authorization close to the data: the proxy redirect is not enough on its own.
  const user = await requireUser(ROUTES.dashboard);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bem-vindo(a)!</CardTitle>
        <CardDescription>
          Você está autenticado como <strong className="text-foreground">{user.email}</strong>. Esta
          área privada está pronta para receber as funcionalidades da aplicação.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
