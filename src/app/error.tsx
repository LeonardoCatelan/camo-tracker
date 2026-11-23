"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  /** Whatever was thrown; only Server Component errors are guaranteed to be `Error` instances. */
  error: unknown;
  /** Re-fetches and re-renders the segment that failed. */
  retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Algo deu errado</h1>
      <p className="max-w-md text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente em instantes.
      </p>
      {digest ? <p className="text-xs text-muted-foreground">Código: {digest}</p> : null}
      <Button onClick={retry}>Tentar novamente</Button>
    </main>
  );
}
