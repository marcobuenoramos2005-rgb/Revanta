"use client";

import Link from "next/link";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { cn } from "cn";

import { signOut } from "@/app/(auth)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string, email: string) {
  const source = name.trim() || email;
  return source.slice(0, 1).toUpperCase();
}

export function UserMenuDropdown({
  variant,
  email,
  businessName,
}: {
  variant: "sidebar" | "header";
  email: string;
  businessName: string;
}) {
  const avatar = (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {initials(businessName, email)}
    </span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menú de la cuenta"
        className={cn(
          "flex items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          variant === "sidebar" && "w-full justify-center p-1.5 hover:bg-sidebar-accent/60 lg:justify-start lg:p-2",
        )}
      >
        {avatar}
        {variant === "sidebar" && (
          <span className="hidden min-w-0 flex-1 lg:block">
            <span className="block truncate text-sm font-medium">{businessName || "Mi negocio"}</span>
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "header" ? "end" : "start"} side={variant === "sidebar" ? "top" : "bottom"} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/ajustes" />}>
          <SettingsIcon /> Ajustes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOutIcon /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
