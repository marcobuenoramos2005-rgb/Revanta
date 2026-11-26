"use client";

import { useActionState } from "react";

import { setNewPassword } from "@/app/(auth)/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { NewPasswordFields } from "@/components/forms/new-password-fields";
import { SubmitButton } from "@/components/forms/submit-button";
import { initialFormState } from "@/lib/form-state";

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(setNewPassword, initialFormState);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      <NewPasswordFields fieldErrors={state.fieldErrors} />
      <SubmitButton pending={pending} pendingText="Guardando…" size="lg" className="w-full">
        Guardar contraseña
      </SubmitButton>
    </form>
  );
}
