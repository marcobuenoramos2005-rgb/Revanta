"use client";

import { useActionState } from "react";
import { MailCheckIcon } from "lucide-react";

import { resendConfirmation, signUp } from "@/app/(auth)/actions";
import { FieldErrorText } from "@/components/forms/field-error";
import { FormAlert } from "@/components/forms/form-alert";
import { PasswordInput } from "@/components/forms/password-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/schemas";
import { initialFormState } from "@/lib/form-state";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initialFormState);

  if (state.success) return <CheckYourEmail email={state.success} />;

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

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          aria-invalid={!!state.fieldErrors?.password}
          aria-describedby="password-hint"
        />
        {state.fieldErrors?.password ? (
          <FieldErrorText id="password-hint" errors={state.fieldErrors.password} />
        ) : (
          <p id="password-hint" className="text-sm text-muted-foreground">
            Mínimo {PASSWORD_MIN_LENGTH} caracteres.
          </p>
        )}
      </div>

      <SubmitButton pending={pending} pendingText="Creando cuenta…" size="lg" className="w-full">
        Crear cuenta
      </SubmitButton>
    </form>
  );
}

function CheckYourEmail({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendConfirmation, initialFormState);

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <MailCheckIcon className="size-7" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">Revisa tu email</h2>
        <p className="text-sm text-muted-foreground">
          Te hemos enviado un enlace de confirmación a <strong className="text-foreground">{email}</strong>.
          Ábrelo para activar tu cuenta.
        </p>
      </div>
      {state.error && <FormAlert variant="error">{state.error}</FormAlert>}
      {state.success && <FormAlert variant="success">{state.success}</FormAlert>}
      <form action={action}>
        <input type="hidden" name="email" value={email} />
        <SubmitButton pending={pending} variant="outline" className="w-full">
          Reenviar email
        </SubmitButton>
      </form>
      <p className="text-xs text-muted-foreground">¿No lo encuentras? Mira en la carpeta de spam.</p>
    </div>
  );
}
