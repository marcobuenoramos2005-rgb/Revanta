import { CopyButton } from "./copy-button";

/** Título y descripción de un anuncio con sus botones de copiar. */
export function ListingText({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Título</h3>
          <CopyButton text={title} label="Copiar título" />
        </div>
        <p className="font-medium break-words">{title}</p>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
          <CopyButton text={description} label="Copiar descripción" />
        </div>
        <p className="text-sm break-words whitespace-pre-wrap">{description}</p>
      </div>
    </div>
  );
}
