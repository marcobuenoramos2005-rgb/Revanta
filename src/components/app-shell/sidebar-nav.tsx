"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

import { isActive, navItems } from "@/lib/navigation";

/**
 * Navegación lateral.
 * - iPad vertical (md): barra estrecha con icono y etiqueta debajo.
 * - iPad horizontal / escritorio (lg): barra completa con icono y texto.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center rounded-xl text-sm font-medium transition-colors",
              "flex-col gap-1 px-1 py-2.5 text-[0.7rem] lg:flex-row lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                active ? "text-sidebar-primary" : "text-current",
              )}
            />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
