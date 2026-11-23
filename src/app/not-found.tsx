import { LinkButton } from "@/components/shared/link-button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <LinkButton href={ROUTES.home}>Voltar para o início</LinkButton>
    </main>
  );
}
