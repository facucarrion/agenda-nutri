import type { Metadata } from "next";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Nueva contraseña · Agenda Nutri",
};

// Reached from the recovery email: /auth/callback opens the session and
// sends the user here.
export default function ResetPage() {
  return <ResetForm />;
}
