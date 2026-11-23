import { type AuthError } from "@supabase/supabase-js";

import { type TypedSupabaseClient } from "@/lib/supabase/types";

import { type EmailConfirmationParams } from "../schemas/auth.schemas";
import {
  type AuthCredentials,
  type AuthFailure,
  type AuthOperationResult,
  type AuthUser,
  type SignUpResult,
} from "../types/auth.types";

import { getAuthErrorMessage, isKnownAuthError } from "./auth-errors";

function toFailure(error: AuthError): AuthFailure {
  // Unknown errors reach the user as a generic message; log the details so the cause
  // (misconfigured URL, network failure, new Supabase code) is visible to developers.
  // Only error metadata is logged: never credentials or user input.
  if (!isKnownAuthError(error.code)) {
    console.error("[auth] Erro não mapeado do Supabase Auth:", {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message,
    });
  }
  return { ok: false, message: getAuthErrorMessage(error), code: error.code };
}

function toResult(error: AuthError | null): AuthOperationResult {
  return error ? toFailure(error) : { ok: true };
}

/**
 * Thin wrapper around Supabase Auth. Receives the client as a dependency so it works
 * with both browser and server clients and can be unit tested with a fake.
 */
export function createAuthService(supabase: TypedSupabaseClient) {
  return {
    async signIn({ email, password }: AuthCredentials): Promise<AuthOperationResult> {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return toResult(error);
    },

    async signUp(
      { email, password }: AuthCredentials,
      emailRedirectTo: string,
    ): Promise<SignUpResult> {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });
      if (error) return toFailure(error);
      return { ok: true, requiresEmailConfirmation: data.session === null };
    },

    async signOut(): Promise<AuthOperationResult> {
      const { error } = await supabase.auth.signOut();
      return toResult(error);
    },

    async requestPasswordReset(email: string, redirectTo: string): Promise<AuthOperationResult> {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      return toResult(error);
    },

    async updatePassword(password: string): Promise<AuthOperationResult> {
      const { error } = await supabase.auth.updateUser({ password });
      return toResult(error);
    },

    /** Establishes a session from an email link (PKCE code or OTP token hash). */
    async confirmEmail(params: EmailConfirmationParams): Promise<AuthOperationResult> {
      const { error } =
        "code" in params
          ? await supabase.auth.exchangeCodeForSession(params.code)
          : await supabase.auth.verifyOtp({ type: params.type, token_hash: params.token_hash });
      return toResult(error);
    },

    /** Returns the user from verified JWT claims, or `null` when there is no valid session. */
    async getCurrentUser(): Promise<AuthUser | null> {
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) return null;
      const { sub, email } = data.claims;
      return { id: sub, email: typeof email === "string" ? email : null };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
