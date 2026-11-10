"use client";

import { useActionState } from "react";
import { Trash2Icon } from "lucide-react";

import { deleteProduct } from "@/app/(app)/inventario/actions";
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
import { initialFormState } from "@/lib/form-state";

export function DeleteProductDialog({ id, title }: { id: string; title: string }) {
  const [state, action, pending] = useActionState(deleteProduct, initialFormState);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon data-icon="inline-start" /> Eliminar
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="space-y-5">
          <input type="hidden" name="id" value={id} />
          <DialogHeader>
            <DialogTitle>¿Eliminar este producto?</DialogTitle>
            <DialogDescription>
              Se borrará «{title}» con sus fotos. Esta acción no se puede deshacer. Si solo quieres
              ocultarlo, cámbialo a «Archivado».
            </DialogDescription>
          </DialogHeader>
          {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
            <SubmitButton pending={pending} pendingText="Eliminando…" variant="destructive">
              Eliminar producto
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
