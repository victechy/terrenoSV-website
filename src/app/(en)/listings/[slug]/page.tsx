import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchListings } from "@/lib/listings";
import ListingDetailView from "@/components/views/ListingDetailView";

export async function generateStaticParams() {
  const listings = await fetchListings().catch(() => []);
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listings = await fetchListings().catch(() => []);
  const listing = listings.find((l) => l.slug === slug);
  if (!listing) return {};

  const description = listing.description.en || listing.description.es;
  return {
    title: listing.title,
    description,
    alternates: { languages: { en: `/listings/${slug}`, es: `/es/listings/${slug}` } },
    openGraph: {
      title: listing.title,
      description,
      images: listing.photos.slice(0, 1),
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listings = await fetchListings().catch(() => []);
  const listing = listings.find((l) => l.slug === slug);
  if (!listing) notFound();

  return <ListingDetailView listing={listing} locale="en" />;
}
