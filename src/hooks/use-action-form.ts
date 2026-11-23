"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import { type z } from "zod";

import { type ActionFailure, type ActionResult, type ActionSuccess } from "@/types/action-result";

const UNEXPECTED_ERROR = "Ocorreu um erro inesperado. Tente novamente.";

interface UseActionFormOptions<TValues extends FieldValues, TData> {
  schema: z.ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
  action: (values: TValues) => Promise<ActionResult<TData>>;
  onSuccess?: (result: ActionSuccess<TData>) => void;
}

interface UseActionFormReturn<TValues extends FieldValues> {
  form: UseFormReturn<TValues>;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  successMessage: string | null;
}

function applyFailure<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  failure: ActionFailure,
): void {
  Object.entries(failure.fieldErrors ?? {}).forEach(([field, messages]) => {
    const message = messages?.[0];
    if (message && field !== "root") form.setError(field as Path<TValues>, { message });
  });
  form.setError("root", { message: failure.error });
}

/**
 * Connects a React Hook Form instance (validated with Zod on the client) to a
 * Server Action that returns an `ActionResult`, mapping server errors back to fields.
 */
export function useActionForm<TValues extends FieldValues, TData>({
  schema,
  defaultValues,
  action,
  onSuccess,
}: UseActionFormOptions<TValues, TData>): UseActionFormReturn<TValues> {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<TValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSuccessMessage(null);
    try {
      const result = await action(values);
      if (!result.success) {
        applyFailure(form, result);
        return;
      }
      setSuccessMessage(result.message ?? null);
      onSuccess?.(result);
    } catch (error) {
      console.error(error);
      form.setError("root", { message: UNEXPECTED_ERROR });
    }
  });

  return { form, onSubmit, successMessage };
}
