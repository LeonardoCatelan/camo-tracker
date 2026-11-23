import { describe, expect, it } from "vitest";

import {
  GENERIC_AUTH_ERROR,
  getAuthErrorMessage,
  isRateLimitError,
} from "@/features/auth/services/auth-errors";

describe("getAuthErrorMessage", () => {
  it("translates known Supabase error codes", () => {
    expect(getAuthErrorMessage({ code: "invalid_credentials" })).toBe("E-mail ou senha inválidos.");
  });

  it("falls back to a generic message for unknown or missing codes", () => {
    expect(getAuthErrorMessage({ code: "something_new" })).toBe(GENERIC_AUTH_ERROR);
    expect(getAuthErrorMessage({})).toBe(GENERIC_AUTH_ERROR);
    expect(getAuthErrorMessage(null)).toBe(GENERIC_AUTH_ERROR);
  });
});

describe("isRateLimitError", () => {
  it("detects rate limit codes only", () => {
    expect(isRateLimitError("over_email_send_rate_limit")).toBe(true);
    expect(isRateLimitError("invalid_credentials")).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
  });
});
