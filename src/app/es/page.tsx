import type { Metadata } from "next";
import { fetchListings } from "@/lib/listings";
import HomeView from "@/components/views/HomeView";

export const metadata: Metadata = {
  title: { absolute: "terrenoSV: Terrenos y Propiedades en El Salvador" },
  description:
    "Explora propiedades y terrenos verificados en El Salvador, convierte manzanas y varas a acres, y recibe la guía detrás de la app y el libro terrenoSV.",
  alternates: { languages: { en: "/", es: "/es" } },
};

export default async function HomeEs() {
  const listings = await fetchListings().catch(() => []);
  return <HomeView locale="es" featured={listings} />;
}
