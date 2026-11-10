/** Formatea un importe en la moneda del usuario, p. ej. 12,50 €. */
export function formatMoney(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
}

/** Formatea una fecha ISO (AAAA-MM-DD) como "5 nov 2026" sin depender de la zona horaria. */
export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** Símbolo de la moneda, p. ej. "€". */
export function currencySymbol(currency = "EUR") {
  return (
    new Intl.NumberFormat("es-ES", { style: "currency", currency })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}
