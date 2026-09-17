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
      className="group flex flex-col overflow-hidden rounded-xl bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
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

        <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
          {isRental ? dict.listings.forRent : dict.listings.forSale}
        </span>

        <div className="absolute right-3 top-3">
          <FavoriteButton listingId={listing.id} locale={locale} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            {listing.price ? `$${formatUsdCurrency(listing.price)}` : "N/A"}
          </span>
          {primary?.perUnitPrice && (
            <span className="shrink-0 text-xs font-medium text-foreground-muted">
              ${formatUsdCurrency(primary.perUnitPrice)}/{unitLabels[primary.unit][locale]}
            </span>
          )}
        </div>

        <h3 className="line-clamp-1 text-sm font-medium text-foreground">{listing.title}</h3>
        <p className="line-clamp-1 text-sm text-foreground-muted">
          {[listing.municipality, listing.department].filter(Boolean).join(", ")}
        </p>

        {primary && (
          <p className="mt-1 flex items-center gap-1.5 border-t border-border pt-2 text-xs font-medium text-foreground-muted">
            <AreaIcon />
            {formatAreaNumber(primary.value)} {unitLabels[primary.unit][locale]}
          </p>
        )}
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

function AreaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}
