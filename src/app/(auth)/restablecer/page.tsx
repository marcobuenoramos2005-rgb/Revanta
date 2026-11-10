import type { Metadata } from "next";

import { AuthCard } from "@/components/auth-card";
import { NewPasswordForm } from "./new-password-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

// El proxy solo deja entrar aquí con una sesión válida (la crea el enlace del email).
export default function NewPasswordPage() {
  return (
    <AuthCard title="Elige una nueva contraseña" description="Después entrarás directamente en tu panel.">
      <NewPasswordForm />
    </AuthCard>
  );
}
