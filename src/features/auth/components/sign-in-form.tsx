"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { FormField } from "@/components/shared/form-field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { REDIRECT_QUERY_PARAM, ROUTES } from "@/constants/routes";
import { useActionForm } from "@/hooks/use-action-form";

import { signInAction } from "../actions/auth.actions";
import { type SignInInput, signInSchema } from "../schemas/auth.schemas";
import { type AuthRedirectData } from "../types/auth.types";

import { useAuthRedirect } from "../hooks/use-auth-redirect";

export function SignInForm() {
  const redirectTo = useSearchParams().get(REDIRECT_QUERY_PARAM);
  const handleRedirect = useAuthRedirect();
  const { form, onSubmit } = useActionForm<SignInInput, AuthRedirectData>({
    schema: signInSchema,
    defaultValues: { email: "", password: "" },
    action: (values) => signInAction(values, redirectTo),
    onSuccess: handleRedirect,
  });
  const { errors, isSubmitting } = form.formState;

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
      <div className="grid gap-2">
        <FormField
          id="password"
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...form.register("password")}
        />
        <Link
          href={ROUTES.forgotPassword}
          className="justify-self-end text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Esqueceu a senha?
        </Link>
      </div>
      <SubmitButton isPending={isSubmitting} pendingLabel="Entrando..." className="w-full">
        Entrar
      </SubmitButton>
    </form>
  );
}
