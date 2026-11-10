import type { Metadata } from "next";
import { PackageIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Inventario" };

export default async function Page() {
  await requireUser();
  return (
    <>
      <PageHeader
        title="Inventario"
        description="Todo lo que tienes a la venta, en un solo lugar."
        actions={
          <Button disabled>
            <PlusIcon data-icon="inline-start" /> Añadir producto
          </Button>
        }
      />
      <EmptyState icon={PackageIcon} title="Tu inventario está vacío" description="Aquí verás tus productos con su estado, precio de compra y fotos.">
        <ComingSoonBadge phase={3} />
      </EmptyState>
    </>
  );
}
