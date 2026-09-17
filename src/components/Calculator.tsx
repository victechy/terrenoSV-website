"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AreaUnit, conversionFactors, formatAreaNumber, formatUsdCurrency, unitLabels } from "@/lib/converter";
import { Locale, getDictionary } from "@/lib/dictionary";
import { deriveAreaResult, parseListingText } from "@/lib/listingParser";

const ALL_UNITS = Object.keys(conversionFactors) as AreaUnit[];

// Groups digits with thousands commas for display ("70000" -> "70,000")
// while leaving the raw value (what's actually stored/computed with)
// untouched — so someone who doesn't bother typing separators still sees an
// unambiguous number once they tab away.
function formatThousands(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${groupedInt}.${decPart}` : groupedInt;
}

// A plain numeric input, except it shows comma-grouped digits once the field
// isn't focused — full-precision, no separators while actively typing (so
// commas don't fight with cursor position), grouped as soon as you tab away.
function NumberField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={focused ? value : formatThousands(value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const raw = e.target.value.replace(/,/g, "");
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) onChange(raw);
      }}
      className={className}
    />
  );
}

export default function Calculator({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<AreaUnit>("manzanas");
  const [price, setPrice] = useState("");

  const [pasteText, setPasteText] = useState("");
  const [detectedMessage, setDetectedMessage] = useState<string | null>(null);
  // Construction note (if any) followed by cost-per-unit line(s), in that
  // order — same order the app's "Detected" box shows them in.
  const [detectedExtraLines, setDetectedExtraLines] = useState<string[]>([]);

  const numericAmount = parseFloat(amount);
  const numericPrice = parseFloat(price);

  const baseMeters = useMemo(
    () => (isFinite(numericAmount) ? numericAmount * conversionFactors[unit] : NaN),
    [numericAmount, unit]
  );

  const results = useMemo(() => {
    if (!isFinite(baseMeters)) return [];
    return ALL_UNITS.filter((u) => u !== unit).map((u) => ({
      unit: u,
      value: baseMeters / conversionFactors[u],
    }));
  }, [baseMeters, unit]);

  const hasPrice = isFinite(numericPrice) && numericPrice > 0 && isFinite(baseMeters) && baseMeters > 0;

  // Parses free text copied from a Facebook/Encuentra24/WhatsApp listing and
  // fills in the manual fields below with whatever it finds — dimensions,
  // total area, or a construction size — instead of duplicating a second
  // results table just for pasted listings.
  const handleParseListing = (textOverride?: string) => {
    const parsed = parseListingText(textOverride ?? pasteText);
    const { land, construction, usedConstructionAsPrimary } = deriveAreaResult(parsed);
    const primary = land || (usedConstructionAsPrimary ? construction : null);

    if (!primary) {
      setDetectedMessage(dict.calculator.noDetection);
      setDetectedExtraLines([]);
      return;
    }

    setAmount(String(primary.value));
    setUnit(primary.unit);

    if (parsed.manzanaRemainder) {
      const { manzanas, remainderVaras } = parsed.manzanaRemainder;
      setDetectedMessage(
        dict.calculator.detectedManzanaRemainder(
          formatAreaNumber(manzanas),
          formatAreaNumber(remainderVaras),
          formatAreaNumber(primary.value)
        )
      );
    } else if (parsed.sides.length >= 2) {
      const [sideA, sideB] = parsed.sides;
      const sideUnitLabel = sideA.unit === "varas2" ? "varas" : locale === "es" ? "metros" : "meters";
      setDetectedMessage(
        dict.calculator.detectedFrenteFondo(
          formatAreaNumber(sideA.value),
          formatAreaNumber(sideB.value),
          sideUnitLabel,
          formatAreaNumber(primary.value),
          unitLabels[primary.unit][locale]
        )
      );
    } else if (usedConstructionAsPrimary) {
      setDetectedMessage(dict.calculator.detectedConstructionOnly(formatAreaNumber(primary.value), unitLabels[primary.unit][locale]));
    } else {
      setDetectedMessage(dict.calculator.detectedArea(formatAreaNumber(primary.value), unitLabels[primary.unit][locale]));
    }

    const extraLines: string[] = [];
    if (construction && !usedConstructionAsPrimary) {
      extraLines.push(
        dict.calculator.detectedConstructionNote(formatAreaNumber(construction.value), unitLabels[construction.unit][locale])
      );
    }

    // Cost per unit: a single follow-up line using the same unit the area
    // was just detected in (mirrors the app), except the manzana+varas case,
    // which leads with manzanas as the primary unit so both rates are shown.
    const baseValueInMeters = primary.value * conversionFactors[primary.unit];
    const isDualRateCase = !!(parsed.manzanaRemainder && primary.unit === "varas2" && parsed.totalPrice);

    if (isDualRateCase && parsed.totalPrice) {
      const areaInManzanas = baseValueInMeters / conversionFactors["manzanas"];
      const pricePerManzana = parsed.totalPrice / areaInManzanas;
      const pricePerVaras = parsed.totalPrice / primary.value;
      extraLines.push(dict.calculator.costPerUnitLine(unitLabels["manzanas"][locale], `$${formatUsdCurrency(pricePerManzana)}`));
      extraLines.push(dict.calculator.costPerUnitLine(unitLabels["varas2"][locale], `$${formatUsdCurrency(pricePerVaras)}`));
    } else if (parsed.totalPrice) {
      const pricePerDetectedUnit = parsed.totalPrice / primary.value;
      extraLines.push(dict.calculator.costPerUnitLine(unitLabels[primary.unit][locale], `$${formatUsdCurrency(pricePerDetectedUnit)}`));
    } else if (parsed.pricePerUnit) {
      const { rate, unit: rateUnit } = parsed.pricePerUnit;
      let priceForLine = rate;
      let unitForLine = rateUnit;
      if (primary.unit !== rateUnit) {
        // Convert the stated rate into the detected area's unit so the line
        // stays consistent with the "Detected" line above it.
        priceForLine = (rate * conversionFactors[primary.unit]) / conversionFactors[rateUnit];
        unitForLine = primary.unit;
      }
      extraLines.push(dict.calculator.costPerUnitLine(unitLabels[unitForLine][locale], `$${formatUsdCurrency(priceForLine)}`));
    }

    setDetectedExtraLines(extraLines);

    if (parsed.totalPrice) {
      setPrice(String(parsed.totalPrice));
    } else if (parsed.pricePerUnit) {
      // No total was stated, just a rate ("$45/v2") — back it out into an
      // equivalent total so the price-per-unit table below still works for
      // every unit, not just the one the rate happened to be quoted in.
      const equivalentTotal = parsed.pricePerUnit.rate * (baseValueInMeters / conversionFactors[parsed.pricePerUnit.unit]);
      setPrice(String(equivalentTotal));
    }
  };

  // Lets the homepage's calculator glimpse hand off a pasted listing: it
  // navigates here with ?paste=<text>, and this runs the same parse
  // automatically so the visitor lands straight on their result.
  const searchParams = useSearchParams();
  useEffect(() => {
    const paste = searchParams.get("paste");
    if (!paste) return;
    // Deliberate: syncing local state from the URL on arrival, a one-time
    // hydration from an external source, not a value derivable from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPasteText(paste);
    handleParseListing(paste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div>
      <div className="mb-6 rounded-xl bg-surface p-6 shadow-panel">
        <h2 className="text-sm font-semibold text-foreground-muted">{dict.calculator.modePaste}</h2>
        <p className="mt-1 text-xs text-foreground-muted">{dict.calculator.pasteTitle}</p>

        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={dict.calculator.pastePlaceholder}
          rows={3}
          className="mt-3 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
        />

        <button
          type="button"
          onClick={() => handleParseListing()}
          disabled={!pasteText.trim()}
          className="mt-3 rounded-lg bg-accent-warm px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {dict.calculator.calculateButton}
        </button>

        {detectedMessage && (
          <div className="mt-4 rounded-lg bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{detectedMessage}</p>
            {detectedExtraLines.map((line, i) => (
              <p key={i} className="mt-1 text-foreground-muted">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-foreground-muted">{dict.calculator.modeManual}</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-6 shadow-panel">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground-muted">
                {dict.calculator.inputLabel}
              </label>
              <NumberField
                value={amount}
                onChange={setAmount}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground-muted">
                {dict.calculator.unitLabel}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as AreaUnit)}
                className="h-[50px] cursor-pointer rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {unitLabels[u][locale]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="mt-6 mb-3 text-sm font-semibold text-foreground-muted">{dict.calculator.resultsTitle}</h3>
          <ul className="divide-y divide-border">
            {results.map((r) => (
              <li key={r.unit} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-foreground-muted">{unitLabels[r.unit][locale]}</span>
                <span className="font-mono text-sm font-semibold text-foreground">{formatAreaNumber(r.value)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface p-6 shadow-panel">
          <h3 className="text-sm font-semibold text-foreground-muted">{dict.calculator.priceCalcTitle}</h3>
          <p className="mt-1 text-sm text-foreground-muted">{dict.calculator.priceCalcSubtitle}</p>

          <label className="mt-4 mb-1 block text-xs font-medium text-foreground-muted">
            {dict.calculator.priceLabel}
          </label>
          <div className="flex items-center rounded-lg border border-border bg-background px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <span className="text-foreground-muted">$</span>
            <NumberField
              value={price}
              onChange={setPrice}
              className="w-full bg-transparent px-2 py-3 text-lg font-semibold outline-none"
            />
          </div>

          <ul className="mt-6 divide-y divide-border">
            {hasPrice &&
              [{ unit, value: numericAmount }, ...results].map((r) => (
                <li key={r.unit} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-foreground-muted">/ {unitLabels[r.unit][locale]}</span>
                  <span className="font-mono text-sm font-semibold text-primary">
                    ${formatUsdCurrency(numericPrice / (baseMeters / conversionFactors[r.unit]))}
                  </span>
                </li>
              ))}
            {!hasPrice && (
              <li className="py-6 text-center text-sm text-foreground-muted">{dict.calculator.priceLabel}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
