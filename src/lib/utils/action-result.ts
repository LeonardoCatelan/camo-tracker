import { type z } from "zod";

import { type ActionFailure, type ActionSuccess } from "@/types/action-result";

export function actionSuccess(message?: string): ActionSuccess;
export function actionSuccess<TData>(
  message: string | undefined,
  data: TData,
): ActionSuccess<TData>;
export function actionSuccess<TData>(
  message?: string,
  data?: TData,
): ActionSuccess<TData | undefined> {
  return { success: true, data, message };
}

export function actionFailure(
  error: string,
  fieldErrors?: ActionFailure["fieldErrors"],
): ActionFailure {
  return { success: false, error, fieldErrors };
}

export const INVALID_INPUT_MESSAGE = "Dados inválidos. Revise os campos destacados.";

export function validationFailure(error: z.ZodError): ActionFailure {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "root";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return actionFailure(INVALID_INPUT_MESSAGE, fieldErrors);
}
