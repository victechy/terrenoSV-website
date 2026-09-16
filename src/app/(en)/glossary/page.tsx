import type { Metadata } from "next";
import GlossaryView from "@/components/views/GlossaryView";

export const metadata: Metadata = {
  title: "Salvadoran Land Measurement Glossary",
  description: "What is a manzana, vara², or tarea? Salvadoran land measurements explained, converted to acres, feet² and meters².",
  alternates: { languages: { en: "/glossary", es: "/es/glossary" } },
};

export default function GlossaryPage() {
  return <GlossaryView locale="en" />;
}
