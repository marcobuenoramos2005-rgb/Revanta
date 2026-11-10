import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth-card";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Crea tu cuenta"
      description="Empieza a controlar tu inventario, ventas y beneficios."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
