export const ROUTES = {
  home: "/",
  login: "/login",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  updatePassword: "/update-password",
  authConfirm: "/auth/confirm",
  authError: "/auth/error",
  weapons: "/weapons",
  /** Unlisted page describing the project stack. */
  stack: "/stack",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Page of a weapon, optionally in a specific game mode. */
export function weaponRoute(weaponId: string, modeId?: string): string {
  const base = `${ROUTES.weapons}/${encodeURIComponent(weaponId)}`;
  return modeId ? `${base}/${encodeURIComponent(modeId)}` : base;
}

/**
 * Routes reachable without a session (prefix match). Everything else requires
 * authentication: the whole app, including the catalog, is private.
 */
export const PUBLIC_ROUTES: readonly string[] = [
  ROUTES.login,
  ROUTES.signUp,
  ROUTES.forgotPassword,
  ROUTES.authConfirm,
  ROUTES.authError,
];

/** Routes meant only for guests; authenticated users are sent to the dashboard. */
export const GUEST_ONLY_ROUTES: readonly string[] = [
  ROUTES.login,
  ROUTES.signUp,
  ROUTES.forgotPassword,
];

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.home;

/** Query parameter used to send the user back to the page they originally requested. */
export const REDIRECT_QUERY_PARAM = "next";
