"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { initialFormState, type FormState } from "@/lib/form-state";

/** Botón destructivo que pide confirmación antes de ejecutar una acción del servidor. */
export function ConfirmDialog({
  action,
  fields,
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" type="button" />}>{trigger}</DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-5">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
            <SubmitButton pending={pending} pendingText={pendingLabel} variant="destructive">
              {confirmLabel}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
