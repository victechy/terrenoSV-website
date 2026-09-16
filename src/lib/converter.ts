/**
 * Salvadoran land-area unit conversion — ported 1:1 from the app's
 * SalvadoranAreaConverter.js so figures match exactly between app and site.
 */
export type AreaUnit =
  | "meters2"
  | "feet2"
  | "acres"
  | "varas2"
  | "tareas"
  | "manzanas"
  | "hectares";

export const conversionFactors: Record<AreaUnit, number> = {
  meters2: 1,
  feet2: 0.092903,
  acres: 4046.8564224,
  varas2: 0.698896,
  tareas: 437.06,
  manzanas: 6988.96,
  hectares: 10000,
};

export const unitLabels: Record<AreaUnit, { es: string; en: string }> = {
  meters2: { es: "Metros²", en: "Meters²" },
  feet2: { es: "Pies²", en: "Feet²" },
  acres: { es: "Acres", en: "Acres" },
  varas2: { es: "Varas²", en: "Varas²" },
  tareas: { es: "Tareas", en: "Tareas" },
  manzanas: { es: "Manzanas", en: "Manzanas" },
  hectares: { es: "Hectáreas", en: "Hectares" },
};

// Local units first (what a Salvadoran buyer already thinks in), then
// feet²/acres for the US-based diaspora/repatriado audience the book
// targets. Hectares excluded from quick-convert — official/government unit,
// not one either audience thinks in day to day.
export const QUICK_CONVERT_UNITS: AreaUnit[] = [
  "varas2",
  "manzanas",
  "meters2",
  "feet2",
  "acres",
];

export function formatAreaNumber(num: number): string {
  if (num < 0.000001) return num.toExponential(3);
  if (num < 0.001) return num.toFixed(6).replace(/\.?0+$/, "");
  if (num < 0.01) return num.toFixed(5).replace(/\.?0+$/, "");
  if (num < 1) return num.toFixed(4).replace(/\.?0+$/, "");
  return new Intl.NumberFormat("es-SV", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatUsdCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function convert(value: number, from: AreaUnit, to: AreaUnit): number {
  const baseMeters = value * conversionFactors[from];
  return baseMeters / conversionFactors[to];
}
