"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Listing } from "@/lib/listings";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";
import { formatAreaNumber, formatUsdCurrency, unitLabels } from "@/lib/converter";
import FavoriteButton from "./FavoriteButton";

const DOT_DISPLAY_LIMIT = 8;
const SWIPE_THRESHOLD_PX = 30;

export default function ListingCard({ listing, locale }: { listing: Listing; locale: Locale }) {
  const dict = getDictionary(locale);
  const photos = listing.photos;
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const primary = listing.conversion?.primary;
  const isRental = listing.transaction === "Alquiler";

  const changePhoto = (e: React.SyntheticEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + delta + photos.length) % photos.length);
  };

  const goToPhoto = (e: React.SyntheticEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex(i);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || photos.length < 2) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) < Math.abs(dy)) return;
    changePhoto(e, dx < 0 ? 1 : -1);
  };

  return (
    <Link
      href={localizedPath(`/listings/${listing.slug}`, locale)}
      className="group flex flex-col overflow-hidden rounded-xl bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div
        className="relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden bg-surface-muted"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {photos.length > 0 ? (
          <Image
            key={photos[index]}
            src={photos[index]}
            alt={listing.title}
            fill
            unoptimized
            draggable={false}
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

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => changePhoto(e, -1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={(e) => changePhoto(e, 1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronIcon direction="right" />
            </button>

            {photos.length <= DOT_DISPLAY_LIMIT ? (
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {photos.map((p, i) => (
                  <button
                    key={p + i}
                    type="button"
                    aria-label={`Photo ${i + 1}`}
                    onClick={(e) => goToPhoto(e, i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
                {index + 1}/{photos.length}
              </span>
            )}
          </>
        )}
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

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
      />
    </svg>
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
