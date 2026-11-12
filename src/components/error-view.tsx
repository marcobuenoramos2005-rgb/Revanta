"use client";

import { useEffect } from "react";
import { RotateCwIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Pantalla de error común: mensaje claro, sin detalles técnicos, y opción de reintentar. */
export function ErrorView({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Queda en la consola del navegador para diagnóstico; no se muestra al usuario.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center rounded-2xl border bg-card px-6 py-12 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-7" />
      </div>
      <h1 className="text-lg font-semibold">Algo ha fallado</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        No hemos podido cargar esta página. Tus datos están a salvo. Comprueba tu conexión e inténtalo
        de nuevo.
      </p>
      <Button className="mt-6" onClick={() => retry()}>
        <RotateCwIcon data-icon="inline-start" /> Reintentar
      </Button>
    </div>
  );
}
