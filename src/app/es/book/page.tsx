import type { Metadata } from "next";
import BookView from "@/components/views/BookView";

export const metadata: Metadata = {
  title: "El Libro — Moving to El Salvador",
  description: "La guía detrás de terrenoSV: consejos prácticos para mudarte y comprar terreno en El Salvador.",
  alternates: { languages: { en: "/book", es: "/es/book" } },
};

export default function BookPageEs() {
  return <BookView locale="es" />;
}
