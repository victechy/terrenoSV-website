import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import Calculator from "@/components/Calculator";

export const metadata: Metadata = {
  title: "Salvadoran Land Unit Calculator",
  description: "Convert manzanas, varas², tareas and hectares to acres, feet² and meters² instantly.",
  alternates: { languages: { en: "/calculator", es: "/es/calculator" } },
};

export default function CalculatorPage() {
  const dict = getDictionary("en");
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">{dict.calculator.title}</h1>
      <p className="mt-1 text-foreground-muted">{dict.calculator.subtitle}</p>
      <div className="mt-8">
        <Calculator locale="en" />
      </div>
    </div>
  );
}
