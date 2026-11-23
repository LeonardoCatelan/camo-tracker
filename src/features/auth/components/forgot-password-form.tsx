"use client";

import { FormField } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { useActionForm } from "@/hooks/use-action-form";

import { requestPasswordResetAction } from "../actions/auth.actions";
import { type ForgotPasswordInput, forgotPasswordSchema } from "../schemas/auth.schemas";

export function ForgotPasswordForm() {
  const { form, onSubmit, successMessage } = useActionForm<ForgotPasswordInput, undefined>({
    schema: forgotPasswordSchema,
    defaultValues: { email: "" },
    action: requestPasswordResetAction,
  });
  const { errors, isSubmitting } = form.formState;

  if (successMessage) return <FormMessage variant="success" message={successMessage} />;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormMessage variant="error" message={errors.root?.message} />
      <FormField
        id="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <SubmitButton isPending={isSubmitting} pendingLabel="Enviando..." className="w-full">
        Enviar link de redefinição
      </SubmitButton>
    </form>
  );
}
