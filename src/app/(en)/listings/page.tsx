import type { Metadata } from "next";
import { fetchListings } from "@/lib/listings";
import { getDictionary } from "@/lib/dictionary";
import ListingsBrowser from "@/components/ListingsBrowser";

export const metadata: Metadata = {
  title: "Property & Land Listings",
  description: "Browse verified land and property listings across El Salvador, updated live.",
  alternates: { languages: { en: "/listings", es: "/es/listings" } },
};

export default async function ListingsPage() {
  const dict = getDictionary("en");
  const listings = await fetchListings().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">{dict.listings.title}</h1>
      <p className="mt-1 text-foreground-muted">{dict.listings.subtitle}</p>
      <div className="mt-8">
        <ListingsBrowser locale="en" initialListings={listings} />
      </div>
    </div>
  );
}
