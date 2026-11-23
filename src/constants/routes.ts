export const ROUTES = {
  home: "/",
  login: "/login",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  updatePassword: "/update-password",
  dashboard: "/dashboard",
  authConfirm: "/auth/confirm",
  authError: "/auth/error",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Routes that require an authenticated session (prefix match). */
export const PROTECTED_ROUTES: readonly string[] = [ROUTES.dashboard, ROUTES.updatePassword];

/** Routes meant only for guests; authenticated users are sent to the dashboard. */
export const GUEST_ONLY_ROUTES: readonly string[] = [
  ROUTES.login,
  ROUTES.signUp,
  ROUTES.forgotPassword,
];

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.dashboard;

/** Query parameter used to send the user back to the page they originally requested. */
export const REDIRECT_QUERY_PARAM = "next";
