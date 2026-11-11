"use client";

import { ErrorView } from "@/components/error-view";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <ErrorView error={error} retry={retry} />
    </main>
  );
}
