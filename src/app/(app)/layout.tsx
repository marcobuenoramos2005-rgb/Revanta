import { Suspense } from "react";
import Link from "next/link";

import { Logo, LogoMark } from "@/components/brand/logo";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { UserMenu } from "@/components/app-shell/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[5.5rem_1fr] lg:grid-cols-[16rem_1fr]">
      {/* Barra lateral: iPad y escritorio */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-sidebar px-2 py-5 md:flex lg:px-4">
        <Link href="/panel" className="mb-8 flex justify-center lg:justify-start lg:px-2" aria-label="Revanta, ir al panel">
          <LogoMark className="lg:hidden" />
          <Logo className="hidden lg:inline-flex" />
        </Link>
        <SidebarNav />
        <div className="mt-auto flex flex-col items-center gap-2 lg:items-stretch">
          <div className="lg:px-1">
            <ThemeToggle />
          </div>
          <Suspense fallback={<Skeleton className="size-9 rounded-full lg:h-13 lg:w-full lg:rounded-xl" />}>
            <UserMenu variant="sidebar" />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        {/* Cabecera: solo iPhone */}
        <header className="sticky top-0 z-30 border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg md:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/panel" aria-label="Revanta, ir al panel">
              <Logo />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
                <UserMenu variant="header" />
              </Suspense>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-12">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}
