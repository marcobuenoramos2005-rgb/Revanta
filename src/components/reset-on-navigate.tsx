"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";

/**
 * Con Cache Components, Next.js conserva el estado de las páginas ya visitadas.
 * Para formularios eso significaría ver datos antiguos al volver a abrirlos.
 * Este componente reinicia su contenido en cada navegación nueva, pero lo
 * conserva al usar los botones atrás/adelante del navegador.
 */
export function ResetOnNavigate({ children }: { children: React.ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
