"use client";

import { FormField } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { PASSWORD_MIN_LENGTH } from "@/lib/validations/common";

import { updatePasswordAction } from "../actions/auth.actions";
import { type UpdatePasswordInput, updatePasswordSchema } from "../schemas/auth.schemas";
import { type AuthRedirectData } from "../types/auth.types";

import { useAuthRedirect } from "../hooks/use-auth-redirect";

export function UpdatePasswordForm() {
  const handleRedirect = useAuthRedirect();
  const { form, onSubmit } = useActionForm<UpdatePasswordInput, AuthRedirectData>({
    schema: updatePasswordSchema,
    defaultValues: { password: "", confirmPassword: "" },
    action: updatePasswordAction,
    onSuccess: handleRedirect,
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormMessage variant="error" message={errors.root?.message} />
      <FormField
        id="password"
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        description={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres, com letras e números.`}
        error={errors.password?.message}
        {...form.register("password")}
      />
      <FormField
        id="confirmPassword"
        label="Confirmar nova senha"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <SubmitButton isPending={isSubmitting} pendingLabel="Salvando..." className="w-full">
        Salvar nova senha
      </SubmitButton>
    </form>
  );
}
