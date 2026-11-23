import { AuthError } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { createAuthService } from "@/features/auth/services/auth.service";
import { type TypedSupabaseClient } from "@/lib/supabase/types";

type AuthClient = TypedSupabaseClient["auth"];

/** Builds a fake client exposing only the auth methods used by each test. */
function createFakeClient(auth: Partial<Record<keyof AuthClient, unknown>>): TypedSupabaseClient {
  return { auth } as unknown as TypedSupabaseClient;
}

const credentials = { email: "user@example.com", password: "senha1234" };

describe("createAuthService", () => {
  describe("signIn", () => {
    it("returns ok when Supabase accepts the credentials", async () => {
      const signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error: null });
      const service = createAuthService(createFakeClient({ signInWithPassword }));

      await expect(service.signIn(credentials)).resolves.toEqual({ ok: true });
      expect(signInWithPassword).toHaveBeenCalledWith(credentials);
    });

    it("maps Supabase errors to a translated failure", async () => {
      const error = new AuthError("Invalid login credentials", 400, "invalid_credentials");
      const signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error });
      const service = createAuthService(createFakeClient({ signInWithPassword }));

      await expect(service.signIn(credentials)).resolves.toEqual({
        ok: false,
        message: "E-mail ou senha inválidos.",
        code: "invalid_credentials",
      });
    });

    it("does not log errors that have a dedicated message", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const error = new AuthError("Invalid login credentials", 400, "invalid_credentials");
      const signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error });

      await createAuthService(createFakeClient({ signInWithPassword })).signIn(credentials);

      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it("logs unknown errors without exposing credentials", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const error = new AuthError("Invalid path specified in request URL", 404);
      const signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error });

      const result = await createAuthService(createFakeClient({ signInWithPassword })).signIn(
        credentials,
      );

      expect(result).toMatchObject({ ok: false });
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("Erro não mapeado"),
        expect.objectContaining({ status: 404, message: "Invalid path specified in request URL" }),
      );
      const logged = JSON.stringify(consoleError.mock.calls);
      expect(logged).not.toContain(credentials.password);
      expect(logged).not.toContain(credentials.email);
      consoleError.mockRestore();
    });
  });

  describe("signUp", () => {
    it.each([
      [null, true],
      [{ access_token: "fake" }, false],
    ])("with session %j requires e-mail confirmation: %s", async (session, expected) => {
      const signUp = vi.fn().mockResolvedValue({ data: { session }, error: null });
      const service = createAuthService(createFakeClient({ signUp }));

      const result = await service.signUp(credentials, "http://localhost:3000/auth/confirm");

      expect(result).toEqual({ ok: true, requiresEmailConfirmation: expected });
      expect(signUp).toHaveBeenCalledWith({
        ...credentials,
        options: { emailRedirectTo: "http://localhost:3000/auth/confirm" },
      });
    });
  });

  describe("confirmEmail", () => {
    it("exchanges a PKCE code for a session", async () => {
      const exchangeCodeForSession = vi.fn().mockResolvedValue({ data: {}, error: null });
      const service = createAuthService(createFakeClient({ exchangeCodeForSession }));

      await expect(service.confirmEmail({ code: "abc" })).resolves.toEqual({ ok: true });
      expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    });

    it("verifies an OTP token hash", async () => {
      const verifyOtp = vi.fn().mockResolvedValue({ data: {}, error: null });
      const service = createAuthService(createFakeClient({ verifyOtp }));

      await service.confirmEmail({ token_hash: "hash", type: "recovery" });
      expect(verifyOtp).toHaveBeenCalledWith({ type: "recovery", token_hash: "hash" });
    });
  });

  describe("getCurrentUser", () => {
    it("returns a narrow user built from the JWT claims", async () => {
      const getClaims = vi.fn().mockResolvedValue({
        data: { claims: { sub: "user-id", email: "user@example.com", role: "authenticated" } },
        error: null,
      });
      const service = createAuthService(createFakeClient({ getClaims }));

      await expect(service.getCurrentUser()).resolves.toEqual({
        id: "user-id",
        email: "user@example.com",
      });
    });

    it("returns null without a valid session", async () => {
      const getClaims = vi.fn().mockResolvedValue({ data: null, error: null });
      const service = createAuthService(createFakeClient({ getClaims }));

      await expect(service.getCurrentUser()).resolves.toBeNull();
    });
  });
});
