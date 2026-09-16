import type { Metadata } from "next";
import BookView from "@/components/views/BookView";

export const metadata: Metadata = {
  title: "The Book: Moving to El Salvador",
  description: "The guidebook behind terrenoSV: practical, first-hand advice on relocating and buying land in El Salvador.",
  alternates: { languages: { en: "/book", es: "/es/book" } },
};

export default function BookPage() {
  return <BookView locale="en" />;
}
