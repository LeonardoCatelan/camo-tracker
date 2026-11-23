# Camo Tracker

Aplicação web com **Next.js 16 + TypeScript + Supabase**, com autenticação, testes e padronização de código já configurados. Pronta para começar a desenvolver funcionalidades.

## Stack

| Área            | Tecnologia                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack, Cache Components) e React 19            |
| Linguagem       | TypeScript em modo `strict` (+ `noUncheckedIndexedAccess`)                 |
| Backend / banco | Supabase (PostgreSQL + Auth) via `@supabase/supabase-js` e `@supabase/ssr` |
| UI              | Tailwind CSS 4, shadcn/ui (Base UI), Lucide React, next-themes             |
| Formulários     | React Hook Form + Zod                                                      |
| Qualidade       | ESLint 9 (flat config), Prettier (com ordenação de classes Tailwind)       |
| Testes          | Vitest + Testing Library (unitários) e Playwright/Chromium (E2E)           |
| Pacotes         | pnpm                                                                       |

## Requisitos

- Node.js **22 ou superior** (desenvolvido com Node 26)
- pnpm **12** (`npm install -g pnpm`)
- Um projeto no [Supabase](https://supabase.com/dashboard) **ou** Docker, para rodar o Supabase localmente

## Instalação

```bash
pnpm install
pnpm test:e2e:install   # baixa o Chromium usado pelo Playwright (só na primeira vez)
```

## Variáveis de ambiente

```bash
cp .env.example .env.local
```

| Variável                               | Onde encontrar                                                     |
| -------------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase Dashboard → Project Settings → Data API → Project URL     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API Keys → Publishable key |

- Use somente a chave **publishable** (`sb_publishable_...`). Ela foi feita para ficar exposta no navegador e é protegida pelas políticas de RLS.
- **Nunca** coloque a chave `secret`/`service_role` em variáveis `NEXT_PUBLIC_*` nem a versione.
- `.env.local` está no `.gitignore`; apenas o `.env.example` é versionado.
- As variáveis são validadas com Zod em [src/lib/env.ts](src/lib/env.ts). Se faltar alguma, o erro diz qual e como corrigir. O `pnpm build` funciona sem elas, porque elas só são lidas em tempo de requisição.

## Configuração do Supabase

### Opção A: projeto na nuvem

1. Crie um projeto em <https://supabase.com/dashboard>.
2. Preencha o `.env.local` como descrito acima.
3. Em **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (em produção, a URL pública da aplicação).
   - **Redirect URLs**: adicione `http://localhost:3000/auth/confirm` e o equivalente em produção (ex.: `https://seu-dominio.com/auth/confirm`).
4. (Opcional) Em **Authentication → Sign In / Providers → Email**, decida se a confirmação de e-mail é obrigatória. O cadastro funciona nos dois casos.
5. Para gerar os tipos do banco, vincule o projeto (o comando pede login no navegador):

   ```bash
   pnpm exec supabase login
   pnpm exec supabase link --project-ref <id-do-projeto>
   pnpm db:types
   ```

### Opção B: Supabase local (Docker)

```bash
pnpm db:start        # sobe Postgres, Auth, Studio e um servidor de e-mails de teste
```

O comando imprime a `API URL` e a `Publishable key` locais; copie os valores para o `.env.local`. A configuração local fica em [supabase/config.toml](supabase/config.toml) e já libera as URLs de redirecionamento de `localhost:3000`. Os e-mails de confirmação e de recuperação de senha podem ser lidos no servidor de e-mails de teste (`http://127.0.0.1:54324`).

```bash
pnpm db:types:local  # gera os tipos a partir do banco local
pnpm db:stop
```

### Tipos do banco

[src/types/database.types.ts](src/types/database.types.ts) começa como um placeholder no mesmo formato gerado pelo Supabase CLI. Depois de criar tabelas (por migrations em `supabase/migrations`), rode `pnpm db:types` ou `pnpm db:types:local`. Os clientes Supabase já são tipados com `Database`, então consultas como `supabase.from("tabela")` passam a ter autocomplete e checagem de tipos.

## Executando localmente

```bash
pnpm dev
```

Acesse <http://localhost:3000>.

## Scripts

| Script                  | Descrição                                                  |
| ----------------------- | ---------------------------------------------------------- |
| `pnpm dev`              | Servidor de desenvolvimento (Turbopack)                    |
| `pnpm build`            | Build de produção                                          |
| `pnpm start`            | Sobe o build de produção                                   |
| `pnpm lint`             | ESLint (`pnpm lint:fix` corrige o que for automático)      |
| `pnpm format`           | Formata o projeto com Prettier                             |
| `pnpm format:check`     | Verifica a formatação sem alterar arquivos                 |
| `pnpm typecheck`        | Checagem de tipos com `tsc`                                |
| `pnpm test`             | Testes unitários (Vitest)                                  |
| `pnpm test:watch`       | Testes unitários em modo watch                             |
| `pnpm test:coverage`    | Testes unitários com relatório de cobertura (`coverage/`)  |
| `pnpm test:e2e`         | Testes E2E (Playwright/Chromium)                           |
| `pnpm test:e2e:ui`      | Testes E2E no modo interativo                              |
| `pnpm test:e2e:install` | Instala o Chromium do Playwright                           |
| `pnpm db:start`         | Sobe o Supabase local (Docker)                             |
| `pnpm db:stop`          | Para o Supabase local                                      |
| `pnpm db:types`         | Gera os tipos do banco a partir do projeto vinculado       |
| `pnpm db:types:local`   | Gera os tipos do banco a partir do Supabase local          |
| `pnpm validate`         | lint + format:check + typecheck + testes unitários + build |

## Testes

```bash
pnpm test             # unitários
pnpm test:coverage    # unitários com cobertura
pnpm test:e2e         # E2E
```

- **Unitários** ficam em `tests/unit/` e rodam em jsdom. Cobrem regras de rota e redirecionamento, schemas Zod, tradução de erros do Supabase, o serviço de autenticação (com um cliente Supabase falso injetado) e componentes. Componentes assíncronos (Server Components) devem ser testados via E2E, como recomenda a documentação do Next.js.
- **E2E** ficam em `tests/e2e/`. O Playwright sobe a aplicação sozinho: `pnpm dev` localmente, ou `pnpm build && pnpm start` quando `CI=true`. Se já houver um servidor rodando na porta, ele é reaproveitado (fora do CI).
  - Porta padrão: `3000`. Para usar outra: `PORT=3100 pnpm test:e2e` (no PowerShell: `$env:PORT=3100; pnpm test:e2e`).
  - Os testes atuais não precisam de um Supabase real: sem cookie de sessão o cliente não faz chamadas à API. Quando as variáveis não estão no shell, o Playwright usa valores fictícios. Testes de login de verdade vão exigir um projeto de teste (ex.: Supabase local) e um usuário criado para isso.

## Build

```bash
pnpm build
pnpm start
```

Com Cache Components, a home e as páginas de autenticação são pré-renderizadas como estáticas. O `/dashboard` usa Partial Prerender: o layout é servido como shell estático e o trecho que lê a sessão chega por streaming dentro de um `<Suspense>`.

## Estrutura de pastas

```
src/
  app/                        # Rotas (App Router). Apenas composição, sem regra de negócio.
    (auth)/                   # login, sign-up, forgot-password, update-password
    (dashboard)/dashboard/    # Área privada
    api/health/               # Health check (GET /api/health)
    auth/confirm/             # Callback dos links de e-mail do Supabase
    auth/error/               # Página de link inválido/expirado
    error.tsx, not-found.tsx  # Tratamento global de erros e 404
    layout.tsx, page.tsx
  components/
    ui/                       # Componentes gerados pelo shadcn/ui (não editar sem necessidade)
    shared/                   # Componentes reutilizáveis (FormField, LinkButton, ThemeToggle...)
    layout/                   # Header, footer
    providers/                # Providers de contexto (tema)
  features/
    auth/
      actions/                # Server Actions (fronteira: validam a entrada com Zod)
      components/             # Formulários e UI da feature
      hooks/                  # Hooks da feature
      schemas/                # Schemas Zod e tipos inferidos
      services/               # Acesso ao Supabase Auth e sessão (server-only)
      types/
  hooks/                      # Hooks genéricos (useActionForm)
  lib/
    supabase/                 # client.ts (browser), server.ts (RSC/Actions), proxy.ts (sessão)
    utils/                    # cn, rotas/redirecionamento seguro, helpers de ActionResult
    validations/              # Schemas Zod reutilizáveis (e-mail, senha)
    env.ts                    # Validação das variáveis de ambiente
  constants/                  # Rotas e configurações do site
  types/                      # Tipos globais (Database, ActionResult)
  proxy.ts                    # Proxy do Next.js 16 (antigo middleware): renova a sessão e protege rotas
supabase/                     # config.toml do Supabase CLI (e futuras migrations)
tests/
  unit/                       # Vitest
  e2e/                        # Playwright
```

## Autenticação: como funciona

1. **Sessão via cookies** (`@supabase/ssr`). O [src/proxy.ts](src/proxy.ts) roda antes de cada requisição, chama `supabase.auth.getClaims()` (valida o JWT e renova a sessão expirada) e aplica as regras de acesso definidas em [src/constants/routes.ts](src/constants/routes.ts):
   - visitante em rota protegida (`/dashboard`, `/update-password`) → `/login?next=<destino>`;
   - usuário logado em rota de visitante (`/login`, `/sign-up`, `/forgot-password`) → `/dashboard`.
2. **Autorização perto dos dados.** O proxy não substitui a checagem no servidor. Use `requireUser()` ([session.service.ts](src/features/auth/services/session.service.ts)) em páginas, Server Actions e Route Handlers que acessam dados privados, além das políticas de RLS no banco.
3. **Formulários.** O React Hook Form valida com Zod no cliente; a Server Action valida de novo (Server Actions são endpoints públicos) e devolve um `ActionResult` tipado, que o hook `useActionForm` converte em erros por campo.
4. **Links de e-mail** (confirmação de cadastro e recuperação de senha) apontam para `/auth/confirm`, que aceita tanto o fluxo PKCE (`?code=`) quanto o de token hash (`?token_hash=&type=`) e redireciona para `next`.
5. **Redirecionamentos seguros.** O parâmetro `next` só aceita caminhos relativos do próprio site, para evitar open redirect.
6. **Recuperação de senha** sempre responde com a mesma mensagem, para não revelar se o e-mail existe.

Para adicionar uma rota privada, inclua o prefixo em `PROTECTED_ROUTES` e chame `requireUser()` no servidor.

## Convenções de desenvolvimento

- **Organização por feature.** Código de domínio fica em `src/features/<feature>/` (actions, components, schemas, services, types). `app/` apenas compõe as rotas.
- **Server x Client.** Componentes são Server Components por padrão; use `"use client"` só quando precisar de estado, efeitos ou APIs do navegador. Módulos que acessam segredos, cookies ou o banco importam `server-only`.
- **Cache Components.** Leituras de request (`cookies()`, `headers()`, sessão) devem ficar dentro de `<Suspense>`, longe do topo dos layouts. Veja `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
- **Validação nas fronteiras.** Toda entrada externa (Server Actions, Route Handlers, query params, env) é validada com Zod. Os tipos vêm de `z.infer`.
- **Erros.** Server Actions retornam `ActionResult` em vez de lançar erros esperados. Erros inesperados caem no `error.tsx`. Mensagens do Supabase são traduzidas em `auth-errors.ts`, sem expor detalhes internos.
- **Tipagem.** Sem `any` (regra do ESLint com nível de erro). Prefira tipos explícitos nas fronteiras públicas.
- **Imports.** Use o alias `@/` para tudo em `src/` e imports relativos apenas dentro da própria feature. Imports de tipo usam `type` inline (regra do ESLint).
- **Nomes.** Arquivos em `kebab-case`; componentes em `PascalCase`; hooks começam com `use`.
- **UI.** Novos componentes do shadcn: `pnpm dlx shadcn@latest add <componente>`. Para links com aparência de botão, use `LinkButton`, que mantém a semântica de link.
- **Credenciais.** Nunca fixe chaves, tokens ou senhas no código, em logs ou em URLs. Use variáveis de ambiente.
- **Antes de abrir um PR:** `pnpm validate` e `pnpm test:e2e`.
