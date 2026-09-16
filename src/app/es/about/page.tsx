import type { Metadata } from "next";
import AboutView from "@/components/views/AboutView";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "terrenoSV conecta a compradores con vendedores verificados de terrenos y propiedades en El Salvador.",
  alternates: { languages: { en: "/about", es: "/es/about" } },
};

export default function AboutPageEs() {
  return <AboutView locale="es" />;
}
