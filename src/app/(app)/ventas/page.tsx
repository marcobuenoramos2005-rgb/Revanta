import type { Metadata } from "next";
import { TagIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Ventas" };

export default async function Page() {
  await requireUser();
  return (
    <>
      <PageHeader
        title="Ventas"
        description="Cada venta con su beneficio neto real."
        actions={
          <Button disabled>
            <PlusIcon data-icon="inline-start" /> Registrar venta
          </Button>
        }
      />
      <EmptyState icon={TagIcon} title="Aún no hay ventas" description="Cuando registres una venta, calcularemos tu beneficio descontando compra, comisiones, envío y gastos.">
        <ComingSoonBadge phase={4} />
      </EmptyState>
    </>
  );
}
