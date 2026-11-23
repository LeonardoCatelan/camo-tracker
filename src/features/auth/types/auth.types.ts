/** Minimal, client-safe representation of the authenticated user. */
export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export type AuthFailure = { ok: false; message: string; code?: string };

export type AuthOperationResult = { ok: true } | AuthFailure;

export type SignUpResult = { ok: true; requiresEmailConfirmation: boolean } | AuthFailure;

export interface AuthRedirectData {
  redirectTo: string;
}
