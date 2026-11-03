import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Crear cuenta · Agenda Nutri",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
