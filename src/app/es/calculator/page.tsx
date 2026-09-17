import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/dictionary";
import { fetchListings } from "@/lib/listings";
import Calculator from "@/components/Calculator";
import ListingsTeaser from "@/components/ListingsTeaser";

export const metadata: Metadata = {
  title: "Calculadora de Medidas Salvadoreñas",
  description: "Convierte manzanas, varas², tareas y hectáreas a acres, pies² y metros² al instante.",
  alternates: { languages: { en: "/calculator", es: "/es/calculator" } },
};

export default async function CalculatorPageEs() {
  const dict = getDictionary("es");
  const listings = await fetchListings().catch(() => []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">{dict.calculator.title}</h1>
      <p className="mt-1 text-foreground-muted">{dict.calculator.subtitle}</p>
      <div className="mt-8">
        <Suspense>
          <Calculator locale="es" />
        </Suspense>
      </div>

      {listings.length > 0 && (
        <div className="mt-16">
          <ListingsTeaser
            locale="es"
            listings={listings}
            title={dict.calculator.listingsTeaserTitle}
            viewAllLabel={dict.calculator.listingsTeaserViewAll}
            count={3}
          />
        </div>
      )}
    </div>
  );
}
