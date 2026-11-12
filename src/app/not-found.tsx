import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div>
        <p className="text-sm font-medium text-primary">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="mt-2 text-muted-foreground">La página que buscas no existe o se ha movido.</p>
      </div>
      <Link href="/" className={buttonVariants()}>
        Volver al inicio
      </Link>
    </main>
  );
}
