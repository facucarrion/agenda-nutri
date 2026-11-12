// Who may use /admin: the emails in ADMIN_EMAILS (server-side env var, comma
// separated). Empty or missing means nobody: the panel fails closed.
// Pure on purpose, so the proxy and the server code share one definition.
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase();
  return Boolean(normalized) && adminEmails().includes(normalized as string);
}
