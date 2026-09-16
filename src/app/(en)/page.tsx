import type { Metadata } from "next";
import { fetchListings } from "@/lib/listings";
import HomeView from "@/components/views/HomeView";

export const metadata: Metadata = {
  alternates: { languages: { en: "/", es: "/es" } },
};

export default async function Home() {
  const listings = await fetchListings().catch(() => []);
  return <HomeView locale="en" featured={listings} />;
}
