import {
  DEFAULT_AUTHENTICATED_ROUTE,
  GUEST_ONLY_ROUTES,
  PUBLIC_ROUTES,
  REDIRECT_QUERY_PARAM,
  ROUTES,
} from "@/constants/routes";

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/** Private by default: only the routes listed in PUBLIC_ROUTES are open to guests. */
export function isProtectedRoute(pathname: string): boolean {
  return !PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.some((route) => matchesRoute(pathname, route));
}

/**
 * Accepts only same-origin relative paths to prevent open redirects
 * (e.g. `//evil.com` or `https://evil.com`).
 */
export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback: string = DEFAULT_AUTHENTICATED_ROUTE,
): string {
  if (!candidate) return fallback;
  const isRelativePath = candidate.startsWith("/") && !candidate.startsWith("//");
  const hasBackslash = candidate.includes("\\");
  return isRelativePath && !hasBackslash ? candidate : fallback;
}

export function buildLoginPath(redirectTo?: string): string {
  if (!redirectTo || redirectTo === ROUTES.home) return ROUTES.login;
  const params = new URLSearchParams({ [REDIRECT_QUERY_PARAM]: redirectTo });
  return `${ROUTES.login}?${params.toString()}`;
}

interface AuthRedirectInput {
  pathname: string;
  search?: string;
  isAuthenticated: boolean;
}

/**
 * Decides where a request must be redirected based on the session state.
 * Returns `null` when the request may proceed.
 */
export function resolveAuthRedirect({
  pathname,
  search = "",
  isAuthenticated,
}: AuthRedirectInput): string | null {
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    return buildLoginPath(`${pathname}${search}`);
  }
  if (isAuthenticated && isGuestOnlyRoute(pathname)) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }
  return null;
}
