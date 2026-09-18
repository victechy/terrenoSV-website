"use client";

import { useEffect, useState } from "react";
import { Listing, fetchListings } from "./listings";

// Re-fetches the live sheet once on mount, but only ever REMOVES a listing
// from the build-time set — never adds one. A brand-new listing's detail
// page is a static file that only exists after the next build, so showing
// its card early would link to a 404. But something rejected by the admin,
// or marked sold/removed by the seller, should disappear immediately —
// its detail page already existed, it just shouldn't be browsable anymore.
// Shared by every page that lists listings client-side (the /listings grid,
// the home page's "Recently listed" teaser, the calculator page's teaser).
export function useLiveListings(initialListings: Listing[]): Listing[] {
  const [listings, setListings] = useState(initialListings);

  useEffect(() => {
    const builtIds = new Set(initialListings.map((l) => l.id));
    let cancelled = false;
    fetchListings()
      .then((fresh) => {
        if (cancelled) return;
        const stillLiveIds = new Set(fresh.map((l) => l.id));
        setListings((prev) => prev.filter((l) => stillLiveIds.has(l.id) && builtIds.has(l.id)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return listings;
}
