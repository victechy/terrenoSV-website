import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/listings";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";
import { formatAreaNumber, formatUsdCurrency, unitLabels } from "@/lib/converter";
import FavoriteButton from "./FavoriteButton";

export default function ListingCard({ listing, locale }: { listing: Listing; locale: Locale }) {
  const dict = getDictionary(locale);
  const photo = listing.photos[0];
  const primary = listing.conversion?.primary;
  const isRental = listing.transaction === "Alquiler";

  return (
    <Link
      href={localizedPath(`/listings/${listing.slug}`, locale)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <PlaceholderIcon />
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {isRental ? dict.listings.forRent : dict.listings.forSale}
        </span>

        <div className="absolute right-3 top-3">
          <FavoriteButton listingId={listing.id} locale={locale} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground">{listing.title}</h3>
        <p className="text-sm text-foreground-muted">
          {[listing.municipality, listing.department].filter(Boolean).join(", ")}
        </p>

        {primary && (
          <p className="text-sm text-foreground-muted">
            {formatAreaNumber(primary.value)} {unitLabels[primary.unit][locale]}
          </p>
        )}

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-bold text-primary">
            {listing.price ? `$${formatUsdCurrency(listing.price)}` : "—"}
          </span>
          {primary?.perUnitPrice && (
            <span className="text-xs text-foreground-muted">
              ${formatUsdCurrency(primary.perUnitPrice)}/{unitLabels[primary.unit][locale]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function PlaceholderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-5 9 5v13M3 21h18M9 21v-6h6v6" />
    </svg>
  );
}
