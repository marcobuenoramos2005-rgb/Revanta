import type { Metadata } from "next";
import { ReceiptIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Gastos" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Gastos"
        description="Envíos, embalaje, transporte y otros costes del negocio."
        actions={
          <Button disabled>
            <PlusIcon data-icon="inline-start" /> Añadir gasto
          </Button>
        }
      />
      <EmptyState icon={ReceiptIcon} title="Aún no hay gastos" description="Registra tus gastos para conocer tu beneficio neto real.">
        <ComingSoonBadge phase={4} />
      </EmptyState>
    </>
  );
}
