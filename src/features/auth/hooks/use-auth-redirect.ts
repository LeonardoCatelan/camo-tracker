"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { type ActionSuccess } from "@/types/action-result";

import { type AuthRedirectData } from "../types/auth.types";

/** Navigates after a successful auth action and refreshes Server Components with the new session. */
export function useAuthRedirect() {
  const router = useRouter();

  return useCallback(
    (result: ActionSuccess<AuthRedirectData | null>) => {
      if (!result.data) return;
      router.replace(result.data.redirectTo);
      router.refresh();
    },
    [router],
  );
}
