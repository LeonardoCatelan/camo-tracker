import { describe, expect, it } from "vitest";

import { ROUTES, weaponRoute } from "@/constants/routes";
import {
  buildLoginPath,
  getSafeRedirectPath,
  isGuestOnlyRoute,
  isProtectedRoute,
  resolveAuthRedirect,
} from "@/lib/utils/routes";

describe("isProtectedRoute", () => {
  it.each(["/", "/weapons/axion", "/weapons/axion/dmz", "/stack", "/update-password", "/anything"])(
    "protects %s (private by default)",
    (path) => {
      expect(isProtectedRoute(path)).toBe(true);
    },
  );

  it.each(["/login", "/sign-up", "/forgot-password", "/auth/confirm", "/auth/error"])(
    "leaves %s public",
    (path) => {
      expect(isProtectedRoute(path)).toBe(false);
    },
  );

  it("matches public routes by segment, not by prefix", () => {
    expect(isProtectedRoute("/login-admin")).toBe(true);
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

describe("weaponRoute", () => {
  it("builds the weapon page path, optionally with a mode", () => {
    expect(weaponRoute("axion")).toBe("/weapons/axion");
    expect(weaponRoute("axion", "dmz")).toBe("/weapons/axion/dmz");
  });
});

describe("getSafeRedirectPath", () => {
  it("accepts same-origin relative paths", () => {
    expect(getSafeRedirectPath("/weapons/axion?tab=1")).toBe("/weapons/axion?tab=1");
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
    expect(getSafeRedirectPath(value)).toBe(ROUTES.home);
  });

  it("uses the provided fallback", () => {
    expect(getSafeRedirectPath("//evil.com", "/login")).toBe("/login");
  });
});

describe("buildLoginPath", () => {
  it("returns the plain login path without a meaningful destination", () => {
    expect(buildLoginPath()).toBe("/login");
    expect(buildLoginPath("/")).toBe("/login");
  });

  it("encodes the destination in the `next` parameter", () => {
    expect(buildLoginPath("/weapons/axion?a=1")).toBe("/login?next=%2Fweapons%2Faxion%3Fa%3D1");
  });
});

describe("resolveAuthRedirect", () => {
  it("sends guests to login, preserving the destination", () => {
    expect(
      resolveAuthRedirect({ pathname: "/weapons/axion", search: "?a=1", isAuthenticated: false }),
    ).toBe("/login?next=%2Fweapons%2Faxion%3Fa%3D1");
    expect(resolveAuthRedirect({ pathname: "/", isAuthenticated: false })).toBe("/login");
  });

  it("sends authenticated users away from guest-only routes", () => {
    expect(resolveAuthRedirect({ pathname: "/login", isAuthenticated: true })).toBe("/");
  });

  it("lets allowed requests through", () => {
    expect(resolveAuthRedirect({ pathname: "/", isAuthenticated: true })).toBeNull();
    expect(resolveAuthRedirect({ pathname: "/login", isAuthenticated: false })).toBeNull();
    expect(resolveAuthRedirect({ pathname: "/auth/confirm", isAuthenticated: false })).toBeNull();
  });
});
