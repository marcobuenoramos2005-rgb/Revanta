import type { Metadata } from "next";
import { SettingsIcon } from "lucide-react";

import { PageHeader } from "@/components/app-shell/page-header";
import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Ajustes" };

export default function Page() {
  return (
    <>
      <PageHeader title="Ajustes" description="Tu cuenta y los datos de tu negocio." />
      <EmptyState
        icon={SettingsIcon}
        title="Ajustes de la cuenta"
        description="Nombre del negocio, moneda, contraseña y cierre de sesión."
      >
        <ComingSoonBadge phase={2} />
      </EmptyState>
    </>
  );
}
