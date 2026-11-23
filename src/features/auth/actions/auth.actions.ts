"use server";

import { redirect } from "next/navigation";

import { DEFAULT_AUTHENTICATED_ROUTE, REDIRECT_QUERY_PARAM, ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { actionFailure, actionSuccess, validationFailure } from "@/lib/utils/action-result";
import { getRequestOrigin } from "@/lib/utils/request-origin";
import { getSafeRedirectPath } from "@/lib/utils/routes";
import { type ActionResult } from "@/types/action-result";

import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "../schemas/auth.schemas";
import { isRateLimitError } from "../services/auth-errors";
import { createAuthService } from "../services/auth.service";
import { type AuthRedirectData } from "../types/auth.types";

// Server Actions are public HTTP endpoints: every input is re-validated here,
// regardless of the validation already performed by the client form.

async function getAuthService() {
  return createAuthService(await createClient());
}

async function buildConfirmationUrl(nextPath: string): Promise<string> {
  const origin = await getRequestOrigin();
  const params = new URLSearchParams({ [REDIRECT_QUERY_PARAM]: nextPath });
  return `${origin}${ROUTES.authConfirm}?${params.toString()}`;
}

export async function signInAction(
  input: unknown,
  redirectTo?: string | null,
): Promise<ActionResult<AuthRedirectData>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const authService = await getAuthService();
  const result = await authService.signIn(parsed.data);
  if (!result.ok) return actionFailure(result.message);

  return actionSuccess(undefined, { redirectTo: getSafeRedirectPath(redirectTo) });
}

export async function signUpAction(input: unknown): Promise<ActionResult<AuthRedirectData | null>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const authService = await getAuthService();
  const emailRedirectTo = await buildConfirmationUrl(DEFAULT_AUTHENTICATED_ROUTE);
  const result = await authService.signUp(parsed.data, emailRedirectTo);
  if (!result.ok) return actionFailure(result.message);

  if (result.requiresEmailConfirmation) {
    return actionSuccess("Conta criada! Enviamos um link de confirmação para o seu e-mail.", null);
  }
  return actionSuccess(undefined, { redirectTo: DEFAULT_AUTHENTICATED_ROUTE });
}

export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const authService = await getAuthService();
  const redirectUrl = await buildConfirmationUrl(ROUTES.updatePassword);
  const result = await authService.requestPasswordReset(parsed.data.email, redirectUrl);

  // Rate limiting is the only error worth surfacing; anything else would reveal
  // whether the e-mail is registered (user enumeration).
  if (!result.ok && isRateLimitError(result.code)) return actionFailure(result.message);

  return actionSuccess(
    "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
  );
}

export async function updatePasswordAction(
  input: unknown,
): Promise<ActionResult<AuthRedirectData>> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const authService = await getAuthService();
  const user = await authService.getCurrentUser();
  if (!user) return actionFailure("Sua sessão expirou. Solicite um novo link de redefinição.");

  const result = await authService.updatePassword(parsed.data.password);
  if (!result.ok) return actionFailure(result.message);

  return actionSuccess("Senha atualizada com sucesso.", {
    redirectTo: DEFAULT_AUTHENTICATED_ROUTE,
  });
}

export async function signOutAction(): Promise<void> {
  const authService = await getAuthService();
  const result = await authService.signOut();
  if (!result.ok) console.error("Falha ao encerrar a sessão no Supabase:", result.message);
  redirect(ROUTES.login);
}
