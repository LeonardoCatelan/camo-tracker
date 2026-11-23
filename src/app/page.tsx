import {
  CheckCircle2,
  Database,
  FlaskConical,
  Layers,
  LogIn,
  Palette,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";

interface StackItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const STACK: readonly StackItem[] = [
  {
    title: "Next.js + React",
    description: "App Router, Server Components, Server Actions e TypeScript strict.",
    icon: Layers,
  },
  {
    title: "Supabase",
    description: "PostgreSQL, Auth com sessão via cookies (SSR) e tipos gerados do schema.",
    icon: Database,
  },
  {
    title: "Autenticação",
    description: "Login, cadastro, recuperação de senha e proteção de rotas privadas.",
    icon: ShieldCheck,
  },
  {
    title: "Interface",
    description: "Tailwind CSS, shadcn/ui, Lucide e tema claro/escuro.",
    icon: Palette,
  },
  {
    title: "Formulários",
    description: "React Hook Form com validação Zod no cliente e no servidor.",
    icon: CheckCircle2,
  },
  {
    title: "Qualidade",
    description: "ESLint, Prettier, Vitest e Playwright configurados.",
    icon: FlaskConical,
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader
        actions={
          <LinkButton href={ROUTES.login} variant="ghost" size="sm">
            Entrar
          </LinkButton>
        }
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 sm:py-20">
        <section className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {SITE_CONFIG.name}
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            {SITE_CONFIG.description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href={ROUTES.signUp} size="lg">
              Criar conta
            </LinkButton>
            <LinkButton href={ROUTES.dashboard} size="lg" variant="outline">
              <LogIn aria-hidden />
              Acessar painel
            </LinkButton>
          </div>
        </section>

        <section aria-labelledby="stack-heading" className="flex flex-col gap-6">
          <h2 id="stack-heading" className="text-center text-xl font-semibold">
            Estrutura configurada
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map(({ title, description, icon: Icon }) => (
              <li key={title}>
                <Card className="h-full">
                  <CardHeader>
                    <Icon className="mb-2 size-5 text-muted-foreground" aria-hidden />
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
