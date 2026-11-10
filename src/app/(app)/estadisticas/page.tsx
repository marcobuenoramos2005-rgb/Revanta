import type { Metadata } from "next";
import { ChartColumnIcon } from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Estadísticas" };

export default async function Page() {
  await requireUser();
  return (
    <>
      <PageHeader
        title="Estadísticas"
        description="Descubre qué te deja más beneficio y dónde vendes mejor."
      />
      <EmptyState
        icon={ChartColumnIcon}
        title="Todavía no hay datos suficientes"
        description="Verás beneficio por mes, por plataforma y por categoría, margen medio y días hasta la venta."
      >
        <ComingSoonBadge phase={5} />
      </EmptyState>
    </>
  );
}
