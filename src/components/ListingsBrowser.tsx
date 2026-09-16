"use client";

import { useEffect, useMemo, useState } from "react";
import { Listing, fetchListings } from "@/lib/listings";
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
  const [listings, setListings] = useState(initialListings);
  // Starts true: the refresh effect below always kicks off a fetch on mount.
  const [refreshing, setRefreshing] = useState(true);

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [transaction, setTransaction] = useState("all");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { isFavorite } = useFavorites();

  // The static page shipped whatever was live at build time (good for SEO
  // and first paint); re-fetch the same public sheet client-side once
  // mounted so a listing approved since the last build still shows up
  // without waiting on a rebuild — same "live data" feel as the app.
  useEffect(() => {
    let cancelled = false;
    fetchListings()
      .then((fresh) => {
        if (!cancelled) setListings(fresh);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={dict.listings.searchPlaceholder}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />

        <div className="flex flex-wrap gap-3">
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
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              favoritesOnly ? "border-accent-warm bg-accent-warm/10 text-accent-warm" : "border-border text-foreground-muted"
            }`}
          >
            {dict.listings.favoritesOnly}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-foreground-muted">
        <span>
          {dict.listings.resultsCount(filtered.length)}
          {refreshing && " · …"}
        </span>
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
      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
    >
      {children}
    </select>
  );
}
