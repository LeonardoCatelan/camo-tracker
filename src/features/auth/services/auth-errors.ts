export const GENERIC_AUTH_ERROR = "Não foi possível concluir a operação. Tente novamente.";

const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  invalid_credentials: "E-mail ou senha inválidos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  user_already_exists: "Já existe uma conta com este e-mail.",
  email_exists: "Já existe uma conta com este e-mail.",
  weak_password: "A senha não atende aos requisitos de segurança.",
  same_password: "A nova senha deve ser diferente da atual.",
  over_email_send_rate_limit: "Muitas solicitações de e-mail. Aguarde alguns minutos.",
  over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos.",
  signup_disabled: "Novos cadastros estão desativados.",
  session_not_found: "Sua sessão expirou. Entre novamente.",
  otp_expired: "O link expirou ou é inválido. Solicite um novo.",
};

interface AuthErrorLike {
  code?: string | undefined;
}

/** Whether the code has a dedicated user-facing message. */
export function isKnownAuthError(code: string | undefined): boolean {
  return code !== undefined && code in AUTH_ERROR_MESSAGES;
}

/** Translates Supabase Auth error codes into user-facing messages. */
export function getAuthErrorMessage(error: AuthErrorLike | null | undefined): string {
  if (!error?.code) return GENERIC_AUTH_ERROR;
  return AUTH_ERROR_MESSAGES[error.code] ?? GENERIC_AUTH_ERROR;
}

const RATE_LIMIT_CODES: ReadonlySet<string> = new Set([
  "over_email_send_rate_limit",
  "over_request_rate_limit",
]);

export function isRateLimitError(code: string | undefined): boolean {
  return code !== undefined && RATE_LIMIT_CODES.has(code);
}
