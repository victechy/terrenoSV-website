import type { Metadata } from "next";
import GlossaryView from "@/components/views/GlossaryView";

export const metadata: Metadata = {
  title: "Glosario de Medidas de Terreno Salvadoreñas",
  description: "¿Qué es una manzana, vara² o tarea? Medidas de terreno salvadoreñas explicadas, convertidas a acres, pies² y metros².",
  alternates: { languages: { en: "/glossary", es: "/es/glossary" } },
};

export default function GlossaryPageEs() {
  return <GlossaryView locale="es" />;
}
