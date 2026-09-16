import type { Metadata } from "next";
import SellView from "@/components/views/SellView";

export const metadata: Metadata = {
  title: "Publica tu Terreno o Propiedad",
  description: "Vende tu terreno o propiedad en El Salvador. Gratis para publicar, revisado antes de salir en línea, visto por compradores en El Salvador y en el exterior.",
  alternates: { languages: { en: "/sell", es: "/es/sell" } },
};

export default function SellPageEs() {
  return <SellView locale="es" />;
}
