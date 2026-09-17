"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";

export default function CalculatorGlimpse({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [text, setText] = useState("");

  const handleCalculate = () => {
    const base = localizedPath("/calculator", locale);
    router.push(text.trim() ? `${base}?paste=${encodeURIComponent(text.trim())}` : base);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">{dict.home.calcGlimpseTitle}</h2>
      <p className="mt-3 text-foreground-muted">{dict.home.calcGlimpseBody}</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={dict.calculator.pastePlaceholder}
        rows={2}
        className="mt-5 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={handleCalculate}
        className="mt-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        {dict.home.calcGlimpseCta}
      </button>
    </div>
  );
}
