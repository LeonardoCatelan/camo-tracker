import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Criar conta"
      description="Cadastre-se com seu e-mail para começar."
      footer={
        <p>
          Já tem uma conta?{" "}
          <Link href={ROUTES.login} className="text-foreground underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
