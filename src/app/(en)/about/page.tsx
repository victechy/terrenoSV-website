import type { Metadata } from "next";
import AboutView from "@/components/views/AboutView";

export const metadata: Metadata = {
  title: "About Us",
  description: "terrenoSV connects buyers with verified land and property sellers in El Salvador.",
  alternates: { languages: { en: "/about", es: "/es/about" } },
};

export default function AboutPage() {
  return <AboutView locale="en" />;
}
