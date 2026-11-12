"use client";

import { useState } from "react";
import { PackageIcon } from "lucide-react";
import { cn } from "cn";

export function PhotoGallery({ photos, title }: { photos: { path: string; url: string }[]; title: string }) {
  const [selected, setSelected] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-card text-muted-foreground">
        <PackageIcon className="size-12" strokeWidth={1.25} />
        <p className="text-sm">Sin fotos</p>
      </div>
    );
  }

  const current = photos[Math.min(selected, photos.length - 1)];
  return (
    <div className="space-y-2">
      <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal */}
        <img src={current.url} alt={`Foto de ${title}`} className="size-full object-contain" />
      </div>
      {photos.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <li key={photo.path} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Ver foto ${index + 1}`}
                aria-pressed={index === selected}
                className={cn(
                  "block size-16 overflow-hidden rounded-xl border-2 bg-muted",
                  index === selected ? "border-primary" : "border-transparent opacity-70",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal */}
                <img src={photo.url} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
