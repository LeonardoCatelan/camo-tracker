import { z } from "zod";

import { emailSchema, existingPasswordSchema, newPasswordSchema } from "@/lib/validations/common";

const PASSWORDS_DO_NOT_MATCH = "As senhas não coincidem.";

export const signInSchema = z.object({
  email: emailSchema,
  password: existingPasswordSchema,
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: PASSWORDS_DO_NOT_MATCH,
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: PASSWORDS_DO_NOT_MATCH,
    path: ["confirmPassword"],
  });

export const EMAIL_OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

/** Query parameters received by the email confirmation route. */
export const emailConfirmationSchema = z.union([
  z.object({ code: z.string().min(1) }),
  z.object({ token_hash: z.string().min(1), type: z.enum(EMAIL_OTP_TYPES) }),
]);

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type EmailConfirmationParams = z.infer<typeof emailConfirmationSchema>;
