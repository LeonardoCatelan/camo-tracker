import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getPublicEnv", () => {
  beforeEach(() => {
    // env.ts caches the parsed value at module level; reload it for each scenario.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the validated public variables", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "fictitious-test-key");
    const { getPublicEnv } = await import("@/lib/env");

    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fictitious-test-key",
    });
  });

  it("throws an actionable error when variables are missing or invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const { getPublicEnv } = await import("@/lib/env");

    expect(() => getPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida/);
    expect(() => getPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não pode ser vazia/);
  });
});
