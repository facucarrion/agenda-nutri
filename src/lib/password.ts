// Password rules shared by the forms (live hints) and the server actions.

export const PASSWORD_RULES = [
  { id: "length", label: "8 caracteres o más", test: (p: string) => p.length >= 8 },
  {
    id: "mix",
    label: "Una letra y un número",
    test: (p: string) => /\p{L}/u.test(p) && /\d/.test(p),
  },
] as const;

export function passwordError(password: string): string | null {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!PASSWORD_RULES[1].test(password)) {
    return "La contraseña tiene que tener al menos una letra y un número.";
  }
  if (password.length > 72) return "La contraseña puede tener hasta 72 caracteres.";
  return null;
}

// 0 = empty, 1 weak, 2 fair, 3 good, 4 very good.
export function passwordScore(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  const basics = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (basics < 2) return basics === 0 ? 1 : password.length >= 8 ? 2 : 1;
  const extra =
    (password.length >= 12 ? 1 : 0) +
    (/[^\p{L}\d]/u.test(password) || (/\p{Lu}/u.test(password) && /\p{Ll}/u.test(password)) ? 1 : 0);
  return extra === 0 ? 3 : 4;
}
