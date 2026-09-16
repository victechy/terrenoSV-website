/**
 * "Paste a listing" parser — ported from the app's SalvadoranAreaConverter.js.
 * Detects dimensions, area, construction size and price straight out of
 * free-text copied from Facebook Marketplace / Encuentra24 / WhatsApp, the
 * way real Salvadoran land listings are actually written.
 */
import type { AreaUnit } from "./converter";

const PARSER_UNIT_ALIASES: Record<AreaUnit, string[]> = {
  // Deliberately NOT including bare "metros"/"mts" here (without "cuadrados").
  // Real listings constantly use bare meters for DISTANCE ("a 700 mts de la
  // carretera"), not area — that caused false-positive area matches when
  // used as a standalone fallback. Bare "metros" is still recognized
  // correctly for frente/fondo/ancho/largo side dimensions, a separate,
  // more specific regex below.
  meters2: ["metros cuadrados", "metro cuadrado", "square meters", "square meter", "sq meters", "sq m", "mts2", "mts²", "m2", "m²", "m"],
  feet2: ["pies cuadrados", "pie cuadrado", "sq ft", "sqft", "ft2", "ft²"],
  acres: ["acres", "acre"],
  varas2: ["varas cuadradas", "vara cuadrada", "v2", "v²", "varas", "vara", "v"],
  tareas: ["tareas", "tarea"],
  manzanas: ["manzanas", "manzana", "mz"],
  hectares: ["hectareas", "hectáreas", "hectarea", "hectárea", "ha"],
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
}

const UNIT_PATTERN = Object.values(PARSER_UNIT_ALIASES)
  .flat()
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join("|");

function normalizeUnit(rawUnit: string): AreaUnit | null {
  const clean = rawUnit.toLowerCase().trim();
  for (const [key, aliases] of Object.entries(PARSER_UNIT_ALIASES)) {
    if (aliases.includes(clean)) return key as AreaUnit;
  }
  return null;
}

function parseNumber(raw: string): number | null {
  const num = parseFloat(raw.replace(/,/g, ""));
  return isNaN(num) ? null : num;
}

const FRENTE_FONDO_REGEX = new RegExp(
  `(\\d[\\d,]*\\.?\\d*)\\s*(metros?|meters?|mts?|m|varas?|v)?\\s*(?:de\\s*)?(frente|fondo|largo|ancho)`,
  "gi"
);
const SIMPLE_DIMENSIONS_REGEX = new RegExp(
  `(\\d[\\d,]*\\.?\\d*)\\s*(metros?|meters?|mts?|m|varas?|v)?\\s*(?:x|×|\\*|\\bpor\\b|\\bby\\b)\\s*(\\d[\\d,]*\\.?\\d*)\\s*(metros?|meters?|mts?|m|varas?|v)?(?![a-zA-Z])`,
  "i"
);
// Handles listings with exactly ONE explicit side label and a second, bare
// number right after it ("20 meters frente 45 meters", "20 frente by 45",
// "20 de frente y 45"), where neither the two-label loop (needs two
// keywords) nor SIMPLE_DIMENSIONS_REGEX (needs a bare x/por/by with no
// stray label word in between) can match.
const SINGLE_LABEL_PAIR_REGEX = new RegExp(
  `(\\d[\\d,]*\\.?\\d*)\\s*(metros?|meters?|mts?|m|varas?|v)?\\s*(?:de\\s*)?(frente|fondo|largo|ancho)\\s*(?:x|×|\\*|\\bpor\\b|\\bby\\b|\\by\\b|\\band\\b)?\\s*(\\d[\\d,]*\\.?\\d*)\\s*(metros?|meters?|mts?|m|varas?|v)?(?![a-zA-Z0-9])`,
  "i"
);

export type ParsedSide = { label: string; value: number; unit: AreaUnit };

function parseSides(text: string): ParsedSide[] {
  const found: ParsedSide[] = [];
  let match: RegExpExecArray | null;
  FRENTE_FONDO_REGEX.lastIndex = 0;
  while ((match = FRENTE_FONDO_REGEX.exec(text)) !== null) {
    const [, numStr, unitHint, label] = match;
    const value = parseNumber(numStr);
    if (value === null) continue;
    const unit: AreaUnit = unitHint && unitHint.toLowerCase().startsWith("v") ? "varas2" : "meters2";
    found.push({ label, value, unit });
  }

  if (found.length === 1) {
    const single = SINGLE_LABEL_PAIR_REGEX.exec(text);
    if (single) {
      const valueA = parseNumber(single[1]);
      const valueB = parseNumber(single[4]);
      if (valueA !== null && valueB !== null) {
        const unitHint = single[2] || single[5];
        const unit: AreaUnit = unitHint && unitHint.toLowerCase().startsWith("v") ? "varas2" : "meters2";
        const firstLabel = single[3].toLowerCase();
        return [
          { label: firstLabel, value: valueA, unit },
          { label: firstLabel === "frente" ? "fondo" : "frente", value: valueB, unit },
        ];
      }
    }
  }

  if (found.length < 2) {
    const dim = text.match(SIMPLE_DIMENSIONS_REGEX);
    if (dim) {
      const [, numA, unitA, numB, unitB] = dim;
      const unitHint = unitA || unitB;
      const unit: AreaUnit = unitHint && unitHint.toLowerCase().startsWith("v") ? "varas2" : "meters2";
      const valueA = parseNumber(numA);
      const valueB = parseNumber(numB);
      if (valueA !== null && valueB !== null) {
        return [
          { label: "frente", value: valueA, unit },
          { label: "fondo", value: valueB, unit },
        ];
      }
    }
  }

  return found;
}

const AREA_REGEX = new RegExp(`(?<!\\ba\\s)\\b(\\d[\\d,]*\\.?\\d*)\\s*(${UNIT_PATTERN})(?![a-zA-Z0-9])`, "gi");

type ParsedAreaMatch = { value: number; unit: AreaUnit; raw: string };

function parseAreas(text: string): ParsedAreaMatch[] {
  const results: ParsedAreaMatch[] = [];
  let match: RegExpExecArray | null;
  AREA_REGEX.lastIndex = 0;
  while ((match = AREA_REGEX.exec(text)) !== null) {
    const value = parseNumber(match[1]);
    const unit = normalizeUnit(match[2]);
    if (value !== null && unit) results.push({ value, unit, raw: match[0].trim() });
  }
  return results;
}

const MANZANA_REMAINDER_REGEX = /(\d+\.?\d*)\s*manzanas?\s*(?:\+|y|más|mas|,)\s*(\d[\d,]*\.?\d*)\s*(varas?|v2|v²)/i;

function parseManzanaRemainder(text: string): { manzanas: number; remainderVaras: number } | null {
  const match = text.match(MANZANA_REMAINDER_REGEX);
  if (!match) return null;
  const manzanas = parseNumber(match[1]);
  const remainderVaras = parseNumber(match[2]);
  if (manzanas === null || remainderVaras === null) return null;
  return { manzanas, remainderVaras };
}

const CONSTRUCTION_REGEX_KEYWORD_FIRST = new RegExp(
  `(?:construcci[oó]n|construction|casa|vivienda)[^\\d]{0,25}(\\d[\\d,]*\\.?\\d*)\\s*(${UNIT_PATTERN})(?![a-zA-Z0-9])`,
  "i"
);
const CONSTRUCTION_REGEX_NUMBER_FIRST = new RegExp(
  `(\\d[\\d,]*\\.?\\d*)\\s*(${UNIT_PATTERN})(?![a-zA-Z0-9])\\s*de\\s*construcci[oó]n`,
  "i"
);

function parseConstruction(text: string): { value: number; unit: AreaUnit } | null {
  let match = text.match(CONSTRUCTION_REGEX_KEYWORD_FIRST);
  if (match) {
    const value = parseNumber(match[1]);
    const unit = normalizeUnit(match[2]);
    if (value !== null && unit) return { value, unit };
  }
  match = text.match(CONSTRUCTION_REGEX_NUMBER_FIRST);
  if (match) {
    const value = parseNumber(match[1]);
    const unit = normalizeUnit(match[2]);
    if (value !== null && unit) return { value, unit };
  }
  return null;
}

const PRICE_PER_UNIT_REGEX = new RegExp(`\\$\\s*([\\d,]+(?:\\.\\d{1,2})?)\\s*(?:\\/|x|por)\\s*(${UNIT_PATTERN})(?![a-zA-Z0-9])`, "gi");
const DOLLAR_REGEX = /\$\s*([\d,]+(?:\.\d{1,2})?)/g;
const PRECIO_KEYWORD_REGEX = /precio\s*:?\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/i;

function parsePricePerUnit(text: string): { rate: number; unit: AreaUnit; matchIndex: number; matchLength: number } | null {
  PRICE_PER_UNIT_REGEX.lastIndex = 0;
  const match = PRICE_PER_UNIT_REGEX.exec(text);
  if (!match) return null;
  const rate = parseNumber(match[1]);
  const unit = normalizeUnit(match[2]);
  if (rate === null || !unit) return null;
  return { rate, unit, matchIndex: match.index, matchLength: match[0].length };
}

function parseTotalPrice(text: string, excludeRange: { start: number; end: number } | null): number | null {
  const candidates: number[] = [];
  let match: RegExpExecArray | null;
  DOLLAR_REGEX.lastIndex = 0;
  while ((match = DOLLAR_REGEX.exec(text)) !== null) {
    if (excludeRange && match.index >= excludeRange.start && match.index < excludeRange.end) continue;
    const value = parseNumber(match[1]);
    if (value !== null) candidates.push(value);
  }
  // Prefer the largest figure found — sale price is usually the biggest
  // number; incidental fees like monthly HOA dues tend to be much smaller.
  if (candidates.length > 0) return Math.max(...candidates);

  // Fallback: some casual listings state "PRECIO 180,000" with no $ sign,
  // trusting readers to assume USD. Only attempted when no per-unit rate was
  // found at all, otherwise "Precio: $200/v2" would double-count the figure.
  if (!excludeRange) {
    const precioMatch = text.match(PRECIO_KEYWORD_REGEX);
    if (precioMatch) {
      const value = parseNumber(precioMatch[1]);
      if (value !== null) return value;
    }
  }

  return null;
}

export type ParsedListing = {
  sides: ParsedSide[];
  areas: ParsedAreaMatch[];
  manzanaRemainder: { manzanas: number; remainderVaras: number } | null;
  construction: { value: number; unit: AreaUnit } | null;
  pricePerUnit: { rate: number; unit: AreaUnit } | null;
  totalPrice: number | null;
};

export function parseListingText(text: string): ParsedListing {
  const perUnit = parsePricePerUnit(text);
  const excludeRange = perUnit ? { start: perUnit.matchIndex, end: perUnit.matchIndex + perUnit.matchLength } : null;
  const totalPrice = parseTotalPrice(text, excludeRange);

  return {
    sides: parseSides(text),
    areas: parseAreas(text),
    manzanaRemainder: parseManzanaRemainder(text),
    construction: parseConstruction(text),
    pricePerUnit: perUnit ? { rate: perUnit.rate, unit: perUnit.unit } : null,
    totalPrice,
  };
}

export type DerivedArea = {
  land: { value: number; unit: AreaUnit } | null;
  construction: { value: number; unit: AreaUnit } | null;
  usedConstructionAsPrimary: boolean;
};

// Detection priority: manzana+varas remainder > frente/fondo sides > plain
// area > construction as a last resort.
export function deriveAreaResult(parsed: ParsedListing): DerivedArea {
  let land: { value: number; unit: AreaUnit } | null = null;
  let usedConstructionAsPrimary = false;

  if (parsed.manzanaRemainder) {
    const { manzanas, remainderVaras } = parsed.manzanaRemainder;
    land = { value: manzanas * 10000 + remainderVaras, unit: "varas2" };
  } else if (parsed.sides.length >= 2) {
    const [sideA, sideB] = parsed.sides;
    land = { value: sideA.value * sideB.value, unit: sideA.unit };
  } else if (parsed.areas.length > 0) {
    const landCandidate = parsed.areas.find((a) => {
      if (!parsed.construction) return true;
      return !(a.value === parsed.construction.value && a.unit === parsed.construction.unit);
    });
    if (landCandidate) {
      land = { value: landCandidate.value, unit: landCandidate.unit };
    } else if (parsed.construction) {
      land = { value: parsed.construction.value, unit: parsed.construction.unit };
      usedConstructionAsPrimary = true;
    }
  } else if (parsed.construction) {
    land = { value: parsed.construction.value, unit: parsed.construction.unit };
    usedConstructionAsPrimary = true;
  }

  return {
    land: usedConstructionAsPrimary ? null : land,
    construction: parsed.construction || null,
    usedConstructionAsPrimary,
  };
}
