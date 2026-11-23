import { describe, expect, it } from "vitest";

import {
  emailConfirmationSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/features/auth/schemas/auth.schemas";

function firstErrorFor(
  result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } },
  field: string,
) {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("signInSchema", () => {
  it("trims the e-mail and accepts valid credentials", () => {
    const result = signInSchema.safeParse({ email: "  user@example.com ", password: "x" });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("user@example.com");
  });

  it("rejects an invalid e-mail and an empty password", () => {
    const result = signInSchema.safeParse({ email: "invalid", password: "" });
    expect(result.success).toBe(false);
    expect(firstErrorFor(result, "email")).toBe("Informe um e-mail válido.");
    expect(firstErrorFor(result, "password")).toBe("Informe a senha.");
  });
});

describe("signUpSchema", () => {
  const valid = { email: "user@example.com", password: "senha1234", confirmPassword: "senha1234" };

  it("accepts a valid payload", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("requires matching passwords", () => {
    const result = signUpSchema.safeParse({ ...valid, confirmPassword: "outra1234" });
    expect(firstErrorFor(result, "confirmPassword")).toBe("As senhas não coincidem.");
  });

  it.each([
    ["short", "a1"],
    ["without digits", "somenteletras"],
    ["without letters", "12345678"],
  ])("rejects a password %s", (_label, password) => {
    const result = signUpSchema.safeParse({ ...valid, password, confirmPassword: password });
    expect(result.success).toBe(false);
    expect(firstErrorFor(result, "password")).toBeDefined();
  });
});

describe("updatePasswordSchema", () => {
  it("requires matching passwords", () => {
    const result = updatePasswordSchema.safeParse({
      password: "senha1234",
      confirmPassword: "senha12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("emailConfirmationSchema", () => {
  it("accepts the PKCE code flow", () => {
    expect(emailConfirmationSchema.safeParse({ code: "abc" }).success).toBe(true);
  });

  it("accepts the token hash flow with a known type", () => {
    const result = emailConfirmationSchema.safeParse({ token_hash: "hash", type: "recovery" });
    expect(result.success).toBe(true);
  });

  it("rejects unknown types and missing parameters", () => {
    expect(emailConfirmationSchema.safeParse({ token_hash: "hash", type: "x" }).success).toBe(
      false,
    );
    expect(emailConfirmationSchema.safeParse({}).success).toBe(false);
  });
});
