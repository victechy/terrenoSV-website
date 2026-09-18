"use client";

import Link from "next/link";
import { Listing } from "@/lib/listings";
import { useLiveListings } from "@/lib/useLiveListings";
import { Locale, localizedPath } from "@/lib/dictionary";
import ListingCard from "./ListingCard";

export default function ListingsTeaser({
  locale,
  listings: initialListings,
  title,
  subtitle,
  viewAllLabel,
  noListingsLabel,
  count = 3,
}: {
  locale: Locale;
  listings: Listing[];
  title: string;
  subtitle?: string;
  viewAllLabel: string;
  noListingsLabel?: string;
  count?: number;
}) {
  const listings = useLiveListings(initialListings);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-foreground-muted">{subtitle}</p>}
        </div>
        <Link
          href={localizedPath("/listings", locale)}
          className="hidden text-sm font-semibold text-primary hover:underline sm:block"
        >
          {viewAllLabel} →
        </Link>
      </div>

      {listings.length === 0 ? (
        noListingsLabel && <p className="mt-10 text-foreground-muted">{noListingsLabel}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, count).map((listing) => (
            <ListingCard key={listing.id} listing={listing} locale={locale} />
          ))}
        </div>
      )}

      <Link
        href={localizedPath("/listings", locale)}
        className="mt-8 block text-center text-sm font-semibold text-primary hover:underline sm:hidden"
      >
        {viewAllLabel} →
      </Link>
    </div>
  );
}
