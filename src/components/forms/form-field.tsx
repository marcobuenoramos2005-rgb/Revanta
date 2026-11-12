import { FieldErrorText } from "@/components/forms/field-error";
import { Label } from "@/components/ui/label";

export function FormField({
  label,
  name,
  errors,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </Label>
      {children}
      {hint && !errors?.length && <p className="text-sm text-muted-foreground">{hint}</p>}
      <FieldErrorText id={`${name}-error`} errors={errors} />
    </div>
  );
}
