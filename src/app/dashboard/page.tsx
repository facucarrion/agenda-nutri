import { redirect } from "next/navigation";

// Turnos is the home of the nutritionist's panel.
export default function DashboardPage() {
  redirect("/dashboard/turnos");
}
