"use client";

import { Locale, getDictionary } from "@/lib/dictionary";
import { useFavorites } from "@/lib/likes";

export default function FavoriteButton({
  listingId,
  locale,
  variant = "icon",
}: {
  listingId: string;
  locale: Locale;
  variant?: "icon" | "full";
}) {
  const dict = getDictionary(locale);
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(listingId);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(listingId);
        }}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          active
            ? "border-accent-warm bg-accent-warm/10 text-accent-warm"
            : "border-border text-foreground-muted hover:border-primary hover:text-primary"
        }`}
        aria-pressed={active}
      >
        <HeartIcon filled={active} />
        {active ? dict.listingDetail.saved : dict.listingDetail.save}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(listingId);
      }}
      aria-pressed={active}
      aria-label={active ? dict.listingDetail.saved : dict.listingDetail.save}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition-colors ${
        active ? "text-accent-warm" : "text-foreground-muted hover:text-accent-warm"
      }`}
    >
      <HeartIcon filled={active} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2.1-.3 4 .8 6.5 3.4C14.5 4.8 16.4 3.7 18.5 4 22 4.5 23.5 8 22 11.2c-2.5 4.7-10 9.3-10 9.3Z"
      />
    </svg>
  );
}
