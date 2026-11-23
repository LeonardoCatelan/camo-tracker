import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ROUTES } from "@/constants/routes";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Entrar"
      description="Acesse sua conta com e-mail e senha."
      footer={
        <p>
          Não tem uma conta?{" "}
          <Link href={ROUTES.signUp} className="text-foreground underline-offset-4 hover:underline">
            Cadastre-se
          </Link>
        </p>
      }
    >
      {/* The form reads the `next` search param, which is only known at request time. */}
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
