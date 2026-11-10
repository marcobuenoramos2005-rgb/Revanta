export type FormState = {
  /** Error general del formulario. */
  error?: string;
  /** Errores por campo. */
  fieldErrors?: Partial<Record<string, string[]>>;
  /** Mensaje de éxito. */
  success?: string;
  /** Valores a conservar en el formulario tras un error (nunca contraseñas). */
  values?: Record<string, string>;
};

export const initialFormState: FormState = {};
