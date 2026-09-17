import { cache } from "react";
import { csvToRecords } from "./csv";
import { AreaUnit, conversionFactors, QUICK_CONVERT_UNITS } from "./converter";

// Same publicly-readable Google Sheet the app reads (Access-Control-Allow-Origin: *
// on the export endpoint, confirmed — no proxy needed). One source of truth:
// a listing submitted through the Google Form shows up on both app and site.
const SHEET_ID = "128JAe0bscus3dxINM0M3ImLMGtbZGC8OAH3f0nSamE0";
export const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const SIDE_UNIT_MAP: Record<string, AreaUnit> = { Metros: "meters2", Varas: "varas2" };
const AREA_UNIT_MAP: Record<string, AreaUnit> = {
  "Metros²": "meters2",
  "Varas²": "varas2",
  Tareas: "tareas",
  Manzanas: "manzanas",
};

export type ListingArea = {
  value: number;
  unit: AreaUnit;
  sides?: { frente: number; fondo: number; unit: AreaUnit };
};

export type ListingConversion = {
  isConstruction: boolean;
  isRental: boolean;
  primary: ListingArea & { perUnitPrice: number | null };
  construction: { value: number; unit: AreaUnit } | null;
  conversions: { unit: AreaUnit; value: number; perUnitPrice: number | null }[];
};

export type Listing = {
  id: string; // raw Timestamp string — the same id the app's likes endpoint keys on
  slug: string;
  title: string;
  propertyType: string;
  transaction: string;
  photos: string[];
  description: { en: string; es: string };
  department: string;
  municipality: string;
  mapUrl: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  price: number | null;
  sellerName: string;
  contactEmail: string;
  contactPhone: string;
  contactPreference: string;
  likes: number;
  conversion: ListingConversion | null;
};

const GOOGLE_MAPS_URL_PREFIXES = [
  "https://www.google.com/maps",
  "https://maps.app.goo.gl",
  "https://goo.gl/maps",
];

function sanitizeMapUrl(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return GOOGLE_MAPS_URL_PREFIXES.some((p) => trimmed.startsWith(p)) ? trimmed : null;
}

// Google Drive's thumbnail endpoint hotlinks reliably as a plain <img> (unlike
// uc?export=view, which often serves an interstitial page instead), but it's
// not built for hotlinking at scale: no CDN caching, and it's slow/throttled
// under load. Routing it through images.weserv.nl gets us a cached, resized,
// webp-compressed copy instead of hitting Drive cold on every page view.
function proxyDriveThumbnail(fileId: string): string {
  const driveUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  return `https://images.weserv.nl/?url=${encodeURIComponent(driveUrl)}&w=1000&output=webp&q=82`;
}

// Ported from ListingsDisplay.js getImageUrls, adapted to proxy every
// resolved Drive thumbnail through images.weserv.nl (see proxyDriveThumbnail).
export function getImageUrls(photosString: string | undefined): string[] {
  if (!photosString) return [];

  return photosString
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .map((url) => {
      if (url.includes("drive.google.com/thumbnail?id=")) {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        return idMatch ? proxyDriveThumbnail(idMatch[1]) : url;
      }

      if (url.includes("drive.google.com/uc?export=view&id=")) {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) return proxyDriveThumbnail(idMatch[1]);
        return url;
      }

      const fileViewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileViewMatch) return proxyDriveThumbnail(fileViewMatch[1]);

      const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (openMatch) return proxyDriveThumbnail(openMatch[1]);

      if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
        return proxyDriveThumbnail(url);
      }

      return url;
    });
}

// Ported from likes.js — 10 digits -> assume US (+1), 8 digits -> assume
// El Salvador (+503), already-prefixed numbers pass through cleaned.
export function formatPhoneForWhatsApp(phoneNumber: string | undefined | null): string | null {
  if (!phoneNumber) return null;
  const cleanPhone = phoneNumber.toString().trim();

  if (cleanPhone.startsWith("+1") || cleanPhone.startsWith("+503")) {
    return cleanPhone.replace(/[^\d+]/g, "");
  }

  const digitsOnly = cleanPhone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `+1${digitsOnly}`;
  if (digitsOnly.length === 8) return `+503${digitsOnly}`;
  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) return `+${digitsOnly}`;
  return digitsOnly.length > 0 ? `+1${digitsOnly}` : null;
}

function deriveStructuredArea(row: Record<string, string>): ListingArea | null {
  const method = row["¿Cómo prefieres ingresar las medidas?"];

  if (method === "Conozco el frente y el fondo") {
    const frente = parseFloat(row["Frente (ancho)"]);
    const fondo = parseFloat(row["Fondo (largo)"]);
    if (!frente || !fondo) return null;
    const unit = SIDE_UNIT_MAP[(row["Unidad de frente"] || "").trim()] || "meters2";
    return { value: frente * fondo, unit, sides: { frente, fondo, unit } };
  }

  if (method === "Ya conozco el área total") {
    const areaTotal = parseFloat(row[" Área total"] ?? row["Área total"]);
    if (!areaTotal) return null;
    const unit = AREA_UNIT_MAP[(row[" Unidad "] ?? row["Unidad"] ?? "").trim()] || "meters2";
    return { value: areaTotal, unit };
  }

  return null;
}

function getListingConversion(row: Record<string, string>): ListingConversion | null {
  const land = deriveStructuredArea(row);
  const constructionM2 = parseFloat(row["📏Área de construcción (m²)"]);
  const construction = constructionM2 > 0 ? { value: constructionM2, unit: "meters2" as AreaUnit } : null;

  const usedConstructionAsPrimary = !land && !!construction;
  const primary = land || (usedConstructionAsPrimary ? construction : null);
  if (!primary) return null;

  const priceRaw = row["Precio (USD)"];
  const price = priceRaw ? parseFloat(String(priceRaw).replace(/[^0-9.]/g, "")) : null;
  const hasPrice = !!price && price > 0;

  const baseValueInMeters = primary.value * conversionFactors[primary.unit];

  const conversions = QUICK_CONVERT_UNITS.filter((u) => u !== primary.unit).map((u) => {
    const value = baseValueInMeters / conversionFactors[u];
    return { unit: u, value, perUnitPrice: hasPrice ? (price as number) / value : null };
  });

  return {
    isConstruction: usedConstructionAsPrimary,
    isRental: row["¿Qué deseas hacer con esta propiedad?"] === "Alquiler",
    primary: { ...primary, perUnitPrice: hasPrice ? (price as number) / primary.value : null },
    construction: !usedConstructionAsPrimary && construction ? construction : null,
    conversions,
  };
}

function slugify(title: string, timestamp: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  // The sheet has no stable id column — Timestamp is unique per submission,
  // so a short hash of it disambiguates listings that share a title.
  let hash = 0;
  for (let i = 0; i < timestamp.length; i++) hash = (hash * 31 + timestamp.charCodeAt(i)) >>> 0;
  const suffix = hash.toString(36).slice(0, 6);
  return `${base || "propiedad"}-${suffix}`;
}

const CONTACT_EMAIL_COL = "Correo electrónico de contacto (el que verán los compradores)";

function mapRow(row: Record<string, string>): Listing | null {
  if (row["Published Status"] !== "Yes") return null;

  // A blank/"Active" Seller Status means the seller hasn't touched it — still
  // live. Anything else ("Pending Sale" / "Sold" / "Removed", set from the
  // seller portal) hides it from the public site, same as an unpublished row.
  const sellerStatus = (row["Seller Status"] || "").trim();
  if (sellerStatus && sellerStatus !== "Active") return null;

  const timestamp = row["Timestamp"];
  const title = row["Título de la propiedad"];
  if (!timestamp || !title) return null;

  const priceRaw = row["Precio (USD)"];
  const price = priceRaw ? parseFloat(String(priceRaw).replace(/[^0-9.]/g, "")) : null;

  const descriptionEs = row["Descripción"] || row["to Spanish"] || "";
  const descriptionEn = row["to English"] || row["Descripción"] || "";

  return {
    id: timestamp,
    slug: slugify(title, timestamp),
    title,
    propertyType: row["Tipo de propiedad"] || "",
    transaction: row["¿Qué deseas hacer con esta propiedad?"] || "Venta",
    photos: getImageUrls(row["Fotos de la propiedad (hasta 5)"]),
    description: { en: descriptionEn, es: descriptionEs },
    department: row["Departamento"] || "",
    municipality: row["Municipio / Distrito"] || "",
    mapUrl: sanitizeMapUrl(row["📍Ubicación en Google Maps (opcional)"]),
    bedrooms: parseInt(row["🛏️Habitaciones"], 10) || null,
    bathrooms: parseFloat(row["🚽Baños"]) || null,
    parking: parseInt(row["🚗Parqueos"], 10) || null,
    price: price && price > 0 ? price : null,
    sellerName: row["Tu nombre completo"] || "",
    contactEmail: row[CONTACT_EMAIL_COL] || "",
    contactPhone: row["Número de teléfono/WhatsApp"] || "",
    contactPreference: row["¿Cómo prefieres que te contacten?"] || "",
    likes: parseInt(row["Likes"], 10) || 0,
    conversion: getListingConversion(row),
  };
}

async function fetchListingsOnce(): Promise<Listing[]> {
  // No `cache: "no-store"` here: under `output: "export"` that option makes
  // Next.js treat this route as needing dynamic (per-request) rendering,
  // which a static export can't do at all — the page render throws
  // NEXT_STATIC_GEN_BAILOUT instead of ever getting to run. The `t=` cache
  // buster below already forces a genuinely fresh fetch on every new build
  // (a unique URL has nothing to reuse from cache); this is also called
  // client-side from ListingsBrowser, where the same unique URL defeats the
  // browser's HTTP cache too, so `no-store` was never doing anything the
  // timestamp wasn't already doing.
  const res = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const csvText = await res.text();
  const records = csvToRecords(csvText);
  return records
    .map(mapRow)
    .filter((l): l is Listing => l !== null)
    // Newest submissions first, mirroring the sheet's own append order reversed.
    .reverse();
}

// A single `next build` calls this from ~30 different places (every locale's
// home/listings pages, generateStaticParams, generateMetadata and detail page
// for every listing) — without memoizing, that's ~30 near-simultaneous
// requests to the same Google Sheets export URL, and a single transient
// failure among them silently produces an empty list on whichever page
// happened to hit it (caught by that page's own `.catch(() => [])`). `cache`
// memoizes this per build/request so it only ever actually fetches once; the
// retry loop below is belt-and-suspenders for that one real fetch.
export const fetchListings = cache(async (): Promise<Listing[]> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchListingsOnce();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
});

export type SellerStatus = "Active" | "Pending Sale" | "Sold" | "Removed";

export type OwnerListing = {
  id: string;
  slug: string;
  title: string;
  photo: string | null;
  price: number | null;
  propertyType: string;
  transaction: string;
  department: string;
  municipality: string;
  publishedStatus: string;
  sellerStatus: SellerStatus;
};

function mapRowForOwner(row: Record<string, string>): OwnerListing | null {
  const timestamp = row["Timestamp"];
  const title = row["Título de la propiedad"];
  if (!timestamp || !title) return null;

  const priceRaw = row["Precio (USD)"];
  const price = priceRaw ? parseFloat(String(priceRaw).replace(/[^0-9.]/g, "")) : null;
  const photos = getImageUrls(row["Fotos de la propiedad (hasta 5)"]);
  const rawSellerStatus = (row["Seller Status"] || "").trim();

  return {
    id: timestamp,
    slug: slugify(title, timestamp),
    title,
    photo: photos[0] ?? null,
    price: price && price > 0 ? price : null,
    propertyType: row["Tipo de propiedad"] || "",
    transaction: row["¿Qué deseas hacer con esta propiedad?"] || "Venta",
    department: row["Departamento"] || "",
    municipality: row["Municipio / Distrito"] || "",
    publishedStatus: row["Published Status"] || "",
    sellerStatus: (["Pending Sale", "Sold", "Removed"] as const).includes(
      rawSellerStatus as "Pending Sale" | "Sold" | "Removed"
    )
      ? (rawSellerStatus as SellerStatus)
      : "Active",
  };
}

// Powers the seller portal (src/app/portal). Deliberately bypasses the
// Published Status / Seller Status filtering mapRow applies — a seller needs
// to see their own pending-approval and already-removed listings too, not
// just the ones currently live on the public site. Safe to read every row
// client-side: the sheet's CSV export is already public (see SHEET_CSV_URL),
// this just filters to one seller's rows by contact email after the fact.
export async function fetchOwnerListings(email: string): Promise<OwnerListing[]> {
  const res = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const csvText = await res.text();
  const records = csvToRecords(csvText);
  const normalized = email.trim().toLowerCase();

  return records
    .filter((row) => (row[CONTACT_EMAIL_COL] || "").trim().toLowerCase() === normalized)
    .map(mapRowForOwner)
    .filter((l): l is OwnerListing => l !== null)
    .reverse();
}
