import Link from "next/link";
import { checkAdmin } from "@/lib/admin";

// Shortcut to /admin, drawn only for the people on ADMIN_EMAILS. Everyone else
// gets nothing in the page (the route is also a 404 for them). Rendered inside
// <Suspense> because it reads the session.
export async function AdminLink() {
  const check = await checkAdmin();
  if (check.status === "none") return null;

  return (
    <Link
      href="/admin"
      className="rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      Administración
    </Link>
  );
}
