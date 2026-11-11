import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, FlaskConicalIcon, InfoIcon } from "lucide-react";

import { ListingGenerator } from "@/components/ai/listing-generator";
import { ListingText } from "@/components/ai/listing-text";
import { PageHeader } from "@/components/app-shell/page-header";
import { ResetOnNavigate } from "@/components/reset-on-navigate";
import { getAiUsage, listProductListings } from "@/lib/ai/service";
import { getProduct } from "@/lib/products/queries";

export const metadata: Metadata = { title: "Anuncio con IA" };

const dateTime = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

export default async function ListingPage({ params }: PageProps<"/inventario/[id]/anuncio">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const [usage, history] = await Promise.all([getAiUsage(), listProductListings(product.id)]);

  return (
    <>
      <Link
        href={`/inventario/${product.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" /> {product.title}
      </Link>
      <PageHeader
        title="Anuncio con IA"
        description="Genera un título y una descripción listos para copiar y pegar en tu plataforma."
      />

      <div className="max-w-2xl space-y-6">
        {usage.mode === "off" && (
          <p className="flex gap-2.5 rounded-xl border bg-muted px-3.5 py-3 text-sm">
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            La generación con IA todavía no está activada en esta instalación.
          </p>
        )}
        {usage.mode === "mock" && (
          <p className="flex gap-2.5 rounded-xl border border-warning/40 bg-warning/10 px-3.5 py-3 text-sm">
            <FlaskConicalIcon className="mt-0.5 size-4 shrink-0" />
            Modo de prueba: los textos son simulados y no los escribe la IA.
          </p>
        )}

        <ResetOnNavigate>
          <ListingGenerator
            productId={product.id}
            mode={usage.mode}
            limit={usage.limit}
            remaining={usage.remaining}
          />
        </ResetOnNavigate>

        {history.length > 0 && (
          <section aria-labelledby="anteriores">
            <h2 id="anteriores" className="mb-3 text-lg font-semibold">
              Anuncios anteriores
            </h2>
            <ul className="space-y-3">
              {history.map((item) => (
                <li key={item.id} className="rounded-2xl border bg-card p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    {dateTime.format(new Date(item.createdAt))}
                    {item.simulated && " · simulado"}
                  </p>
                  <ListingText title={item.title} description={item.description} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
