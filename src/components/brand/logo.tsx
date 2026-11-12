import { cn } from "cn";

/** Símbolo de REVANTA: una "R" cuyo trazo final es una flecha de crecimiento. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-[28%] bg-linear-135 from-[oklch(0.62_0.13_160)] to-[oklch(0.45_0.11_175)]",
        className,
      )}
    >
      <svg viewBox="6 5 20 22" className="size-[65%]">
        <path
          d="M10.5 23.5V8.5h6a4.25 4.25 0 0 1 0 8.5h-6M15.5 17l6 6.5M21.5 18.75v4.75h-4.75"
          fill="none"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight">Revanta</span>
      )}
    </span>
  );
}
