import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth-card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard
      title="Bienvenido de nuevo"
      description="Inicia sesión para gestionar tu negocio."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-primary hover:underline">
            Crear cuenta gratis
          </Link>
        </>
      }
    >
      <Suspense fallback={<FormSkeleton />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginFormWithParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return <LoginForm next={first(params.next)} errorCode={first(params.error)} />;
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-11" />
    </div>
  );
}
