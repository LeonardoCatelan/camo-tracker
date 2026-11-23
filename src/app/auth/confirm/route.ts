import { type NextRequest, NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { emailConfirmationSchema } from "@/features/auth/schemas/auth.schemas";
import { createAuthService } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils/routes";

/**
 * Target of Supabase e-mail links (sign-up confirmation and password recovery).
 * Supports both the PKCE flow (`?code=`) and the token hash flow (`?token_hash=&type=`).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nextPath = getSafeRedirectPath(searchParams.get("next"));
  const errorUrl = new URL(ROUTES.authError, request.url);

  const params = emailConfirmationSchema.safeParse(Object.fromEntries(searchParams));
  if (!params.success) return NextResponse.redirect(errorUrl);

  const authService = createAuthService(await createClient());
  const result = await authService.confirmEmail(params.data);
  if (!result.ok) return NextResponse.redirect(errorUrl);

  return NextResponse.redirect(new URL(nextPath, request.url));
}
