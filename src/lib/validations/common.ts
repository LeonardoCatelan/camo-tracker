import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export const emailSchema = z
  .string()
  .trim()
  .min(1, { error: "Informe o e-mail." })
  .pipe(z.email({ error: "Informe um e-mail válido." }));

/** Password rules applied when a password is created or changed. */
export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, {
    error: `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`,
  })
  .max(PASSWORD_MAX_LENGTH, {
    error: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`,
  })
  .regex(/[a-zA-Z]/, { error: "A senha deve conter ao menos uma letra." })
  .regex(/\d/, { error: "A senha deve conter ao menos um número." });

/** Login only checks presence; strength rules belong to sign-up/reset. */
export const existingPasswordSchema = z.string().min(1, { error: "Informe a senha." });
