import type { Metadata } from "next";
import PrivacyView from "@/components/views/PrivacyView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "terrenoSV's privacy policy, covering both the app and terrenosv.org.",
  alternates: { languages: { en: "/privacy", es: "/es/privacy" } },
};

export default function PrivacyPage() {
  return <PrivacyView locale="en" />;
}
