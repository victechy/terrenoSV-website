import type { Metadata } from "next";
import PrivacyView from "@/components/views/PrivacyView";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de terrenoSV, que cubre tanto la app como terrenosv.org.",
  alternates: { languages: { en: "/privacy", es: "/es/privacy" } },
};

export default function PrivacyPageEs() {
  return <PrivacyView locale="es" />;
}
