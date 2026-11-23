import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";

import { LinkButton } from "@/components/shared/link-button";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Link inválido" };

export default function AuthErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert className="size-10 text-destructive" aria-hidden />
      <h1 className="text-2xl font-semibold">Não foi possível validar o link</h1>
      <p className="max-w-md text-muted-foreground">
        O link pode ter expirado ou já ter sido utilizado. Solicite um novo e tente novamente.
      </p>
      <LinkButton href={ROUTES.login}>Voltar para o login</LinkButton>
    </main>
  );
}
