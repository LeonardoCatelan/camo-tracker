import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  buildLoginPath,
  getSafeRedirectPath,
  isGuestOnlyRoute,
  isProtectedRoute,
  resolveAuthRedirect,
} from "@/lib/utils/routes";

describe("isProtectedRoute", () => {
  it.each(["/dashboard", "/dashboard/settings", "/update-password"])("protects %s", (path) => {
    expect(isProtectedRoute(path)).toBe(true);
  });

  it.each(["/", "/login", "/dashboards", "/api/health"])("does not protect %s", (path) => {
    expect(isProtectedRoute(path)).toBe(false);
  });
});

describe("isGuestOnlyRoute", () => {
  it("matches authentication pages", () => {
    expect(isGuestOnlyRoute("/login")).toBe(true);
    expect(isGuestOnlyRoute("/sign-up")).toBe(true);
    expect(isGuestOnlyRoute("/forgot-password")).toBe(true);
  });

  it("does not match the password update page", () => {
    expect(isGuestOnlyRoute("/update-password")).toBe(false);
  });
});

describe("getSafeRedirectPath", () => {
  it("accepts same-origin relative paths", () => {
    expect(getSafeRedirectPath("/dashboard?tab=1")).toBe("/dashboard?tab=1");
  });

  it.each([
    null,
    undefined,
    "",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
  ])("falls back for unsafe value %s", (value) => {
    expect(getSafeRedirectPath(value)).toBe(ROUTES.dashboard);
  });

  it("uses the provided fallback", () => {
    expect(getSafeRedirectPath("//evil.com", "/")).toBe("/");
  });
});

describe("buildLoginPath", () => {
  it("returns the plain login path without a meaningful destination", () => {
    expect(buildLoginPath()).toBe("/login");
    expect(buildLoginPath("/")).toBe("/login");
  });

  it("encodes the destination in the `next` parameter", () => {
    expect(buildLoginPath("/dashboard?tab=1")).toBe("/login?next=%2Fdashboard%3Ftab%3D1");
  });
});

describe("resolveAuthRedirect", () => {
  it("sends guests on protected routes to login, preserving the destination", () => {
    expect(
      resolveAuthRedirect({ pathname: "/dashboard", search: "?a=1", isAuthenticated: false }),
    ).toBe("/login?next=%2Fdashboard%3Fa%3D1");
  });

  it("sends authenticated users away from guest-only routes", () => {
    expect(resolveAuthRedirect({ pathname: "/login", isAuthenticated: true })).toBe("/dashboard");
  });

  it("lets other requests through", () => {
    expect(resolveAuthRedirect({ pathname: "/", isAuthenticated: false })).toBeNull();
    expect(resolveAuthRedirect({ pathname: "/dashboard", isAuthenticated: true })).toBeNull();
    expect(resolveAuthRedirect({ pathname: "/login", isAuthenticated: false })).toBeNull();
  });
});
