"use client";

import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  pending,
  children,
  pendingText,
  ...props
}: React.ComponentProps<typeof Button> & { pending: boolean; pendingText?: string }) {
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} {...props}>
      {pending && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
      {pending ? (pendingText ?? children) : children}
    </Button>
  );
}
