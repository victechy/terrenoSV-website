"use client";

import { useMemo, useState } from "react";
import { Listing } from "@/lib/listings";
import { useLiveListings } from "@/lib/useLiveListings";
import { Locale, getDictionary } from "@/lib/dictionary";
import { useFavorites } from "@/lib/likes";
import ListingCard from "./ListingCard";

type SortKey = "newest" | "price-asc" | "price-desc";

export default function ListingsBrowser({
  locale,
  initialListings,
}: {
  locale: Locale;
  initialListings: Listing[];
}) {
  const dict = getDictionary(locale);
  const listings = useLiveListings(initialListings);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [transaction, setTransaction] = useState("all");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { isFavorite } = useFavorites();

  const propertyTypes = useMemo(
    () => Array.from(new Set(listings.map((l) => l.propertyType).filter(Boolean))).sort(),
    [listings]
  );
  const departments = useMemo(
    () => Array.from(new Set(listings.map((l) => l.department).filter(Boolean))).sort(),
    [listings]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = listings.filter((l) => {
      if (q) {
        const haystack = `${l.title} ${l.municipality} ${l.department}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (propertyType !== "all" && l.propertyType !== propertyType) return false;
      if (transaction !== "all" && l.transaction !== transaction) return false;
      if (department !== "all" && l.department !== department) return false;
      if (favoritesOnly && !isFavorite(l.id)) return false;
      return true;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    }

    return result;
  }, [listings, search, propertyType, transaction, department, favoritesOnly, sortBy, isFavorite]);

  const clearFilters = () => {
    setSearch("");
    setPropertyType("all");
    setTransaction("all");
    setDepartment("all");
    setFavoritesOnly(false);
    setSortBy("newest");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-panel">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.listings.searchPlaceholder}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Select value={propertyType} onChange={setPropertyType} label={dict.listings.filterType}>
            <option value="all">{dict.listings.allTypes}</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          <Select value={transaction} onChange={setTransaction} label={dict.listings.filterTransaction}>
            <option value="all">{dict.listings.allTransactions}</option>
            <option value="Venta">{dict.listings.forSale}</option>
            <option value="Alquiler">{dict.listings.forRent}</option>
          </Select>

          <Select value={department} onChange={setDepartment} label={dict.listings.filterDepartment}>
            <option value="all">{dict.listings.allDepartments}</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>

          <Select value={sortBy} onChange={(v) => setSortBy(v as SortKey)} label={dict.listings.sortBy}>
            <option value="newest">{dict.listings.sortNewest}</option>
            <option value="price-asc">{dict.listings.sortPriceLow}</option>
            <option value="price-desc">{dict.listings.sortPriceHigh}</option>
          </Select>

          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              favoritesOnly
                ? "border-accent-warm bg-accent-warm/10 text-accent-warm"
                : "border-border text-foreground-muted hover:border-accent-warm/50 hover:text-accent-warm"
            }`}
          >
            <HeartIcon filled={favoritesOnly} />
            {dict.listings.favoritesOnly}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-foreground-muted">
        <span>{dict.listings.resultsCount(filtered.length)}</span>
        {(search || propertyType !== "all" || transaction !== "all" || department !== "all" || favoritesOnly) && (
          <button type="button" onClick={clearFilters} className="font-medium text-primary hover:underline">
            {dict.listings.clearFilters}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-foreground-muted">{dict.listings.noResults}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
    >
      {children}
    </select>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 4c2.1-.3 4 .8 6.5 3.4C14.5 4.8 16.4 3.7 18.5 4 22 4.5 23.5 8 22 11.2c-2.5 4.7-10 9.3-10 9.3Z"
      />
    </svg>
  );
}
