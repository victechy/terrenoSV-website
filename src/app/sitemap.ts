import type { MetadataRoute } from "next";
import { fetchListings } from "@/lib/listings";

export const dynamic = "force-static";

const BASE_URL = "https://terrenosv.org";
const STATIC_PATHS = ["", "/listings", "/calculator", "/book"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await fetchListings().catch(() => []);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) => [
    { url: `${BASE_URL}${path}`, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.8 },
    { url: `${BASE_URL}/es${path}`, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.8 },
  ]);

  const listingEntries: MetadataRoute.Sitemap = listings.flatMap((l) => [
    { url: `${BASE_URL}/listings/${l.slug}`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE_URL}/es/listings/${l.slug}`, changeFrequency: "weekly" as const, priority: 0.6 },
  ]);

  return [...staticEntries, ...listingEntries];
}
