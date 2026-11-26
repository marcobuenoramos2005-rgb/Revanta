"use client";

import { useActionState, useState } from "react";
import { TriangleAlertIcon } from "lucide-react";

import { FieldErrorText } from "@/components/forms/field-error";
import { FormAlert } from "@/components/forms/form-alert";
import { NewPasswordFields } from "@/components/forms/new-password-fields";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, DELETE_CONFIRMATION } from "@/lib/auth/schemas";
import { initialFormState } from "@/lib/form-state";
import { changePassword, deleteAccount, updateProfile } from "./actions";

const currencyLabels: Record<(typeof CURRENCIES)[number], string> = {
  EUR: "Euro (€)",
  USD: "Dólar estadounidense ($)",
  GBP: "Libra esterlina (£)",
};

export function ProfileForm({
  businessName,
  currency,
}: {
  businessName: string;
  currency: string;
}) {
  const [state, action, pending] = useActionState(updateProfile, initialFormState);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      {state.success && <FormAlert variant="success">{state.success}</FormAlert>}

      <div className="space-y-2">
        <Label htmlFor="businessName">Nombre del negocio</Label>
        <Input
          id="businessName"
          name="businessName"
          autoComplete="organization"
          placeholder="Ej.: Vintage de Marta"
          maxLength={100}
          defaultValue={businessName}
          aria-invalid={!!state.fieldErrors?.businessName}
          aria-describedby={state.fieldErrors?.businessName ? "businessName-error" : undefined}
        />
        <FieldErrorText id="businessName-error" errors={state.fieldErrors?.businessName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Moneda</Label>
        <Select name="currency" defaultValue={currency} items={currencyLabels}>
          <SelectTrigger id="currency" className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((code) => (
              <SelectItem key={code} value={code}>
                {currencyLabels[code]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldErrorText id="currency-error" errors={state.fieldErrors?.currency} />
      </div>

      <SubmitButton pending={pending} pendingText="Guardando…">
        Guardar cambios
      </SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initialFormState);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      {state.success && <FormAlert variant="success">{state.success}</FormAlert>}
      <NewPasswordFields key={state.success} fieldErrors={state.fieldErrors} />
      <SubmitButton pending={pending} pendingText="Guardando…">
        Cambiar contraseña
      </SubmitButton>
    </form>
  );
}

export function DeleteAccountDialog() {
  const [state, action, pending] = useActionState(deleteAccount, initialFormState);
  const [confirmation, setConfirmation] = useState("");

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>Eliminar cuenta</DialogTrigger>
      <DialogContent>
        <form action={action} className="space-y-5">
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TriangleAlertIcon className="size-5" />
            </div>
            <DialogTitle>¿Eliminar tu cuenta?</DialogTitle>
            <DialogDescription>
              Se borrarán para siempre tu perfil, inventario, gastos, ventas y fotos. Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {state.error && <FormAlert variant="error">{state.error}</FormAlert>}

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Escribe <strong>{DELETE_CONFIRMATION}</strong> para confirmar
            </Label>
            <Input
              id="confirmation"
              name="confirmation"
              autoComplete="off"
              autoCapitalize="characters"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              aria-invalid={!!state.fieldErrors?.confirmation}
            />
            <FieldErrorText id="confirmation-error" errors={state.fieldErrors?.confirmation} />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
            <SubmitButton
              pending={pending}
              pendingText="Eliminando…"
              variant="destructive"
              disabled={pending || confirmation.trim().toUpperCase() !== DELETE_CONFIRMATION}
            >
              Eliminar definitivamente
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
