import { displayName, getCurrentProfile } from "@/lib/nutritionist";

// Header names of the logged-in account. Rendered inside <Suspense> because
// they read the session.

export async function AccountTitle() {
  const profile = await getCurrentProfile();
  return <>{displayName(profile)}</>;
}

// Shown on the right only when the title is a business name.
export async function AccountPerson() {
  const profile = await getCurrentProfile();
  if (!profile?.businessName?.trim() || !profile.fullName.trim()) return null;
  return (
    <span className="hidden max-w-[200px] truncate text-sm font-medium sm:inline">
      {profile.fullName}
    </span>
  );
}
