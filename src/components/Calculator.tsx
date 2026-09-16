"use client";

import { useMemo, useState } from "react";
import { AreaUnit, conversionFactors, formatAreaNumber, formatUsdCurrency, unitLabels } from "@/lib/converter";
import { Locale, getDictionary } from "@/lib/dictionary";

const ALL_UNITS = Object.keys(conversionFactors) as AreaUnit[];

export default function Calculator({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<AreaUnit>("manzanas");
  const [price, setPrice] = useState("");

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-muted">
              {dict.calculator.inputLabel}
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-semibold outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-muted">
              {dict.calculator.unitLabel}
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as AreaUnit)}
              className="h-[50px] rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
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

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-foreground-muted">{dict.calculator.priceCalcTitle}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{dict.calculator.priceCalcSubtitle}</p>

        <label className="mt-4 mb-1 block text-xs font-medium text-foreground-muted">
          {dict.calculator.priceLabel}
        </label>
        <div className="flex items-center rounded-lg border border-border bg-background px-4 focus-within:border-primary">
          <span className="text-foreground-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
            <li className="py-6 text-center text-sm text-foreground-muted">
              {dict.calculator.priceLabel} →
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
