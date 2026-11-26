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

const APP_TIME_ZONE = "Europe/Madrid";

/** Fecha de hoy (AAAA-MM-DD) en la zona horaria de la app. Solo en tiempo de petición. */
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(new Date());
}

/** Primer día del mes actual y del siguiente (AAAA-MM-DD), para filtrar "este mes". */
export function currentMonthRange() {
  const [year, month] = todayISO().split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`;
  return { start: `${year}-${pad(month)}-01`, end: next };
}

/** Suma importes en céntimos para evitar errores de redondeo. */
export function sumMoney(values: (number | null | undefined)[]) {
  return values.reduce<number>((sum, v) => sum + Math.round((v ?? 0) * 100), 0) / 100;
}

/** Importe para rellenar un campo de formulario: 12.5 → "12,50". */
export function moneyInput(value: number | null | undefined) {
  return value === null || value === undefined ? "" : value.toFixed(2).replace(".", ",");
}

/** Días entre dos fechas ISO (AAAA-MM-DD): b − a. */
export function daysBetween(a: string, b: string) {
  const toUTC = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

/** Porcentaje con un decimal como máximo: 0.456 → "45,6 %". */
export function formatPercent(ratio: number) {
  return new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 1 }).format(ratio);
}

/** Claves "AAAA-MM" de los últimos `count` meses, del más antiguo al actual. */
export function lastMonths(count: number): string[] {
  const [year, month] = todayISO().split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

/** "2026-11" → "nov" (o "nov 26" con año). */
export function monthLabel(key: string, withYear = false) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    ...(withYear ? { year: "2-digit" } : {}),
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace(".", "");
}
