import { FieldErrorText } from "@/components/forms/field-error";
import { PasswordInput } from "@/components/forms/password-input";
import { Label } from "@/components/ui/label";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/schemas";
import type { FormState } from "@/lib/form-state";

export function NewPasswordFields({ fieldErrors }: { fieldErrors?: FormState["fieldErrors"] }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          aria-invalid={!!fieldErrors?.password}
          aria-describedby="password-hint"
        />
        {fieldErrors?.password ? (
          <FieldErrorText id="password-hint" errors={fieldErrors.password} />
        ) : (
          <p id="password-hint" className="text-sm text-muted-foreground">
            Mínimo {PASSWORD_MIN_LENGTH} caracteres.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repite la contraseña</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          aria-invalid={!!fieldErrors?.confirmPassword}
          aria-describedby={fieldErrors?.confirmPassword ? "confirm-error" : undefined}
        />
        <FieldErrorText id="confirm-error" errors={fieldErrors?.confirmPassword} />
      </div>
    </>
  );
}
