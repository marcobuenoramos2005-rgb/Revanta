"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EllipsisIcon } from "lucide-react";
import { cn } from "cn";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isActive, navItems } from "@/lib/navigation";

const primary = navItems.filter((item) => item.mobilePrimary);
const secondary = navItems.filter((item) => !item.mobilePrimary);

/** Barra de pestañas inferior para iPhone (estilo app nativa). */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreActive = secondary.some((item) => isActive(pathname, item.href));

  const tabClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.7rem] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );

  return (
    <nav
      aria-label="Principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 backdrop-blur-lg md:hidden"
    >
      <div className="mx-auto flex max-w-lg">
        {primary.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={tabClass(active)}
            >
              <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className={tabClass(moreActive)}>
            <EllipsisIcon className="size-6" strokeWidth={moreActive ? 2.25 : 1.75} />
            Más
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-safe rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Más opciones</SheetTitle>
            </SheetHeader>
            <div className="grid gap-1 px-4 pb-6">
              {secondary.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-base font-medium hover:bg-muted aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
                >
                  <Icon className="size-5 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
