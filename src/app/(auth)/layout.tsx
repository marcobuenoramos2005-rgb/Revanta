import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-48 h-[36rem] bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_60%)] opacity-15"
      />
      <header className="relative pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href="/" aria-label="Revanta, ir al inicio">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="pb-safe relative flex flex-1 items-start justify-center px-4 pt-6 pb-12 md:items-center md:pt-0">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
