import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({
    error: "NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida (ex.: https://<projeto>.supabase.co).",
  }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string({ error: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não foi definida." })
    .min(1, { error: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não pode ser vazia." }),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cachedEnv: PublicEnv | undefined;

/**
 * Validates public environment variables lazily, so the build does not require
 * credentials and a misconfiguration fails fast with an actionable message.
 *
 * `process.env.NEXT_PUBLIC_*` must be referenced literally so Next.js can inline
 * the values in the browser bundle.
 */
export function getPublicEnv(): PublicEnv {
  if (cachedEnv) return cachedEnv;

  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => `- ${issue.message}`).join("\n");
    throw new Error(
      `Variáveis de ambiente inválidas. Verifique o arquivo .env.local (veja .env.example):\n${details}`,
    );
  }

  cachedEnv = result.data;
  return cachedEnv;
}
