import type { Metadata } from "next";
import SellView from "@/components/views/SellView";

export const metadata: Metadata = {
  title: "List Your Land or Property",
  description: "Sell your land or property in El Salvador. Free to list, reviewed before publishing, seen by buyers in El Salvador and abroad.",
  alternates: { languages: { en: "/sell", es: "/es/sell" } },
};

export default function SellPage() {
  return <SellView locale="en" />;
}
