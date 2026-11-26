"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signIn } from "@/app/(auth)/actions";
import { FieldErrorText } from "@/components/forms/field-error";
import { FormAlert } from "@/components/forms/form-alert";
import { PasswordInput } from "@/components/forms/password-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/form-state";

const linkErrors: Record<string, string> = {
  enlace: "El enlace no es válido o ha caducado. Solicita uno nuevo.",
  navegador:
    "No hemos podido iniciar tu sesión automáticamente. Si estabas confirmando tu cuenta, ya está confirmada: inicia sesión con tu email y contraseña. Si querías cambiar la contraseña, abre el enlace en el mismo navegador donde lo solicitaste.",
};

export function LoginForm({ next, errorCode }: { next?: string; errorCode?: string }) {
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const linkError = errorCode ? linkErrors[errorCode] : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />

      {(state.error || linkError) && <FormAlert variant="error">{state.error ?? linkError}</FormAlert>}

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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link href="/recuperar" className="text-sm font-medium text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={!!state.fieldErrors?.password}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
        <FieldErrorText id="password-error" errors={state.fieldErrors?.password} />
      </div>

      <SubmitButton pending={pending} pendingText="Entrando…" size="lg" className="w-full">
        Iniciar sesión
      </SubmitButton>
    </form>
  );
}
