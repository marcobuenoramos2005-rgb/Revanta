import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth-card";
import { ResetRequestForm } from "./reset-request-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecoverPage() {
  return (
    <AuthCard
      title="¿Olvidaste tu contraseña?"
      description="Escribe tu email y te enviaremos un enlace para elegir una nueva."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <ResetRequestForm />
    </AuthCard>
  );
}
