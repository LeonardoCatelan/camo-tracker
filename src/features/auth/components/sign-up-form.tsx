"use client";

import { FormField } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { useActionForm } from "@/hooks/use-action-form";
import { PASSWORD_MIN_LENGTH } from "@/lib/validations/common";

import { signUpAction } from "../actions/auth.actions";
import { type SignUpInput, signUpSchema } from "../schemas/auth.schemas";
import { type AuthRedirectData } from "../types/auth.types";

import { useAuthRedirect } from "../hooks/use-auth-redirect";

export function SignUpForm() {
  const handleRedirect = useAuthRedirect();
  const { form, onSubmit, successMessage } = useActionForm<SignUpInput, AuthRedirectData | null>({
    schema: signUpSchema,
    defaultValues: { email: "", password: "", confirmPassword: "" },
    action: signUpAction,
    onSuccess: handleRedirect,
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
      <FormField
        id="password"
        label="Senha"
        type="password"
        autoComplete="new-password"
        description={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres, com letras e números.`}
        error={errors.password?.message}
        {...form.register("password")}
      />
      <FormField
        id="confirmPassword"
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <SubmitButton isPending={isSubmitting} pendingLabel="Criando conta..." className="w-full">
        Criar conta
      </SubmitButton>
    </form>
  );
}
