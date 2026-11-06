import { BRAND_NAME } from "@/lib/brand";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: `Crear cuenta · ${BRAND_NAME}`,
};

export default function RegisterPage() {
  return <RegisterForm />;
}
