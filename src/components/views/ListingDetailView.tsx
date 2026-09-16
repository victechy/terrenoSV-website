import Link from "next/link";
import { Listing } from "@/lib/listings";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";
import { formatAreaNumber, formatUsdCurrency, unitLabels } from "@/lib/converter";
import { formatPhoneForWhatsApp } from "@/lib/listings";
import ListingGallery from "../ListingGallery";
import FavoriteButton from "../FavoriteButton";

export default function ListingDetailView({ listing, locale }: { listing: Listing; locale: Locale }) {
  const dict = getDictionary(locale);
  const isRental = listing.transaction === "Alquiler";
  const conversion = listing.conversion;

  const whatsappPhone = formatPhoneForWhatsApp(listing.contactPhone);
  const contactMessage = dict.listingDetail.contactMessage(listing.title);
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace("+", "")}?text=${encodeURIComponent(contactMessage)}`
    : null;
  const mailtoUrl = listing.contactEmail
    ? `mailto:${encodeURIComponent(listing.contactEmail)}?subject=${encodeURIComponent(
        `Consulta sobre: ${listing.title}`
      )}&body=${encodeURIComponent(contactMessage)}`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description[locale],
    url: `https://terrenosv.org${localizedPath(`/listings/${listing.slug}`, locale)}`,
    image: listing.photos,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.municipality,
      addressRegion: listing.department,
      addressCountry: "SV",
    },
    ...(listing.price
      ? { offers: { "@type": "Offer", price: listing.price, priceCurrency: "USD" } }
      : {}),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href={localizedPath("/listings", locale)}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-foreground-muted hover:text-primary"
      >
        ← {dict.listingDetail.back}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ListingGallery photos={listing.photos} title={listing.title} />
        </div>

        <div>
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            {isRental ? dict.listings.forRent : dict.listings.forSale}
          </span>

          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">{listing.title}</h1>
          <p className="mt-1 text-foreground-muted">
            {[listing.municipality, listing.department].filter(Boolean).join(", ")}
          </p>

          <p className="mt-4 text-3xl font-bold text-primary">
            {listing.price ? `$${formatUsdCurrency(listing.price)}` : "N/A"}
          </p>

          {conversion && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground-muted">
              <span>
                {conversion.isConstruction ? dict.listingDetail.constructionSize : dict.listingDetail.landSize}:{" "}
                <strong className="text-foreground">
                  {formatAreaNumber(conversion.primary.value)} {unitLabels[conversion.primary.unit][locale]}
                </strong>
              </span>
              {conversion.construction && (
                <span>
                  {dict.listingDetail.constructionSize}:{" "}
                  <strong className="text-foreground">
                    {formatAreaNumber(conversion.construction.value)} {unitLabels[conversion.construction.unit][locale]}
                  </strong>
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground-muted">
            {listing.bedrooms != null && <span>🛏️ {listing.bedrooms}</span>}
            {listing.bathrooms != null && <span>🚽 {listing.bathrooms}</span>}
            {listing.parking != null && <span>🚗 {listing.parking}</span>}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <FavoriteButton listingId={listing.id} locale={locale} variant="full" />
            {listing.mapUrl && (
              <a
                href={listing.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
              >
                {dict.listingDetail.viewOnMap}
              </a>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground-muted">{dict.listingDetail.contactSeller}</h2>
            {listing.sellerName && (
              <p className="mt-1 text-sm text-foreground-muted">
                {dict.listingDetail.listedBy}: <span className="text-foreground">{listing.sellerName}</span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-success px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  {dict.listingDetail.whatsapp}
                </a>
              )}
              {mailtoUrl && (
                <a
                  href={mailtoUrl}
                  className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  {dict.listingDetail.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {listing.description[locale] && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-lg font-semibold text-foreground">{dict.listingDetail.description}</h2>
          <p className="mt-2 whitespace-pre-line text-foreground-muted">{listing.description[locale]}</p>
        </div>
      )}

      {conversion && conversion.conversions.length > 0 && (
        <div className="mt-10 max-w-md">
          <h2 className="text-lg font-semibold text-foreground">{dict.listingDetail.quickConversions}</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
            {conversion.conversions.map((c) => (
              <li key={c.unit} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-foreground-muted">{unitLabels[c.unit][locale]}</span>
                <span className="font-mono text-sm font-semibold text-foreground">{formatAreaNumber(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
