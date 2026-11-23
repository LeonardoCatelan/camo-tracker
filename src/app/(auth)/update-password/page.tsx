import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";

export const metadata: Metadata = { title: "Nova senha" };

// Access requires a session (established by the recovery e-mail link) and is enforced
// by the proxy; the Server Action re-checks the session before updating the password.
export default function UpdatePasswordPage() {
  return (
    <AuthCard title="Definir nova senha" description="Escolha uma nova senha para sua conta.">
      <UpdatePasswordForm />
    </AuthCard>
  );
}
