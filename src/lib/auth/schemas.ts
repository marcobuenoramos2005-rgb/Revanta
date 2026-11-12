import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Introduce tu email.")
  .pipe(z.email("Introduce un email válido."));

const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`)
  .max(72, "La contraseña no puede tener más de 72 caracteres.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Introduce tu contraseña."),
});

export const signUpSchema = z.object({
  email,
  password: newPassword,
});

export const emailSchema = z.object({ email });

export const newPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const CURRENCIES = ["EUR", "USD", "GBP"] as const;

export const profileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .max(100, "El nombre no puede tener más de 100 caracteres."),
  currency: z.enum(CURRENCIES, "Elige una moneda válida."),
});

/** Texto que hay que escribir para confirmar el borrado de la cuenta. */
export const DELETE_CONFIRMATION = "ELIMINAR";
