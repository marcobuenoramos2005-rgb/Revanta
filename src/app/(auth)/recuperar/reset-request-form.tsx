"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/app/(auth)/actions";
import { FieldErrorText } from "@/components/forms/field-error";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/form-state";

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialFormState);

  if (state.success) return <FormAlert variant="success">{state.success}</FormAlert>;

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          defaultValue={state.values?.email}
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        <FieldErrorText id="email-error" errors={state.fieldErrors?.email} />
      </div>
      <SubmitButton pending={pending} pendingText="Enviando…" size="lg" className="w-full">
        Enviar enlace
      </SubmitButton>
    </form>
  );
}
