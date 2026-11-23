import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  INVALID_INPUT_MESSAGE,
  actionFailure,
  actionSuccess,
  validationFailure,
} from "@/lib/utils/action-result";

describe("action result helpers", () => {
  it("builds success results", () => {
    expect(actionSuccess("ok", { id: 1 })).toEqual({
      success: true,
      message: "ok",
      data: { id: 1 },
    });
  });

  it("builds failure results", () => {
    expect(actionFailure("falhou")).toEqual({
      success: false,
      error: "falhou",
      fieldErrors: undefined,
    });
  });

  it("groups Zod issues by field path", () => {
    const schema = z.object({ email: z.email({ error: "e-mail inválido" }), age: z.number() });
    const parsed = schema.safeParse({ email: "x", age: "1" });
    if (parsed.success) throw new Error("expected validation to fail");

    const result = validationFailure(parsed.error);

    expect(result.error).toBe(INVALID_INPUT_MESSAGE);
    expect(result.fieldErrors?.email).toEqual(["e-mail inválido"]);
    expect(result.fieldErrors?.age).toHaveLength(1);
  });
});
