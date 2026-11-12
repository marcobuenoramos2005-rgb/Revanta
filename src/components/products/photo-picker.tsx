"use client";

import { useRef } from "react";
import { CameraIcon, XIcon } from "lucide-react";

import { MAX_PHOTOS } from "@/lib/products/schema";

export type PhotoItem = {
  key: string;
  /** URL para mostrarla (firmada si ya está subida, local si es nueva). */
  previewUrl: string;
  /** Ruta en el almacenamiento, si ya está subida. */
  path?: string;
  /** Archivo pendiente de subir. */
  file?: File;
};

export function PhotoPicker({
  photos,
  onChange,
  disabled,
}: {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_PHOTOS - photos.length;

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remaining)
      .map((file) => ({
        key: crypto.randomUUID(),
        previewUrl: URL.createObjectURL(file),
        file,
      }));
    onChange([...photos, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo, index) => (
          <li key={photo.key} className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada o local */}
            <img src={photo.previewUrl} alt={`Foto ${index + 1}`} className="size-full object-cover" />
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[0.65rem] font-medium text-white">
                Portada
              </span>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(photos.filter((p) => p.key !== photo.key))}
              aria-label={`Quitar foto ${index + 1}`}
              className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
            >
              <XIcon className="size-4" />
            </button>
          </li>
        ))}
        {remaining > 0 && (
          <li>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/40 hover:text-foreground"
            >
              <CameraIcon className="size-6" />
              Añadir foto
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        aria-label="Añadir fotos"
        onChange={(event) => addFiles(event.target.files)}
      />
      <p className="mt-2 text-sm text-muted-foreground">
        Hasta {MAX_PHOTOS} fotos. La primera es la portada.
      </p>
    </div>
  );
}
