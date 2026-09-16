"use client";

import { useCallback, useEffect, useState } from "react";

// Same Apps Script endpoint + shared secret the app posts to (see
// scratch_likes_apps_script.gs / likes.js in the app repo) — the site talks
// to the identical backend, so a like from the web and a favorite in the app
// land in the same Likes column in real time.
const LIKES_ENDPOINT =
  "https://script.google.com/macros/s/AKfycby4V1Mf_XlPvR8mRaFQLmqhrIKZHlIwBNsKttgq4c1lrvIl6WrF39Jq4dChukIAmVw55A/exec";
const LIKES_SHARED_SECRET = "SnVsAzTRrqkSJTxrnEmBZO9NyI1PSRdA";

/** Fire-and-forget — a favorite toggle stays instant and local even if the network call fails. */
export function postLike(listingId: string, action: "like" | "unlike") {
  if (!listingId) return;
  fetch(LIKES_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ listingId, action, secret: LIKES_SHARED_SECRET }),
  }).catch(() => {});
}

const FAVORITES_STORAGE_KEY = "terrenosv_favorites";

export function loadFavoriteIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveFavoriteIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // storage unavailable (private browsing, quota) — favorite still worked for this session
  }
}

/** Per-device favorites (mirrors the app's AsyncStorage-backed FavoritesContext), synced across every mounted instance on this page. */
export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    // Deliberately deferred to an effect rather than a lazy useState
    // initializer: the server-rendered HTML has no localStorage to read, so
    // matching that empty-set render on first client paint (then correcting
    // here, post-mount) avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoriteIds(loadFavoriteIds());
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY) setFavoriteIds(loadFavoriteIds());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        postLike(id, "unlike");
      } else {
        next.add(id);
        postLike(id, "like");
      }
      saveFavoriteIds(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  return { favoriteIds, isFavorite, toggleFavorite };
}
