// "Mantener sesión iniciada" off: the login sets this cookie and the auth
// cookies are then written without maxAge/expires, so the browser deletes
// them when it closes. Shared by the server client and the proxy.
export const SESSION_ONLY_COOKIE = "an-session-only";

export function asSessionCookie<T extends { maxAge?: number; expires?: Date }>(
  options: T,
): T {
  const rest = { ...options };
  delete rest.maxAge;
  delete rest.expires;
  return rest;
}
