import { BRAND_NAME } from "@/lib/brand";
import type { Metadata } from "next";
import { RecoverForm } from "./recover-form";

export const metadata: Metadata = {
  title: `Recuperar contraseña · ${BRAND_NAME}`,
};

export default function RecoverPage() {
  return <RecoverForm />;
}
