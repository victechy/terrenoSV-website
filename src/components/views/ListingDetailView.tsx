import Link from "next/link";
import { Listing } from "@/lib/listings";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";
import { formatAreaNumber, formatUsdCurrency, unitLabels } from "@/lib/converter";
import { formatPhoneForWhatsApp } from "@/lib/listings";
import ListingGallery from "../ListingGallery";
import FavoriteButton from "../FavoriteButton";
import ShareButton from "../ShareButton";

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
          <span className="inline-block rounded-md bg-primary px-3 py-1 text-xs font-semibold tracking-wide text-white">
            {isRental ? dict.listings.forRent : dict.listings.forSale}
          </span>

          <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">{listing.title}</h1>
          <p className="mt-1 text-foreground-muted">
            {[listing.municipality, listing.department].filter(Boolean).join(", ")}
          </p>

          <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
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

          {(listing.bedrooms != null || listing.bathrooms != null || listing.parking != null) && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-sm font-medium text-foreground-muted">
              {listing.bedrooms != null && (
                <span className="inline-flex items-center gap-1.5">
                  <BedIcon /> {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms != null && (
                <span className="inline-flex items-center gap-1.5">
                  <BathIcon /> {listing.bathrooms}
                </span>
              )}
              {listing.parking != null && (
                <span className="inline-flex items-center gap-1.5">
                  <CarIcon /> {listing.parking}
                </span>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <FavoriteButton listingId={listing.id} locale={locale} variant="full" />
            <ShareButton
              text={dict.listingDetail.shareText(listing.title)}
              url={`https://terrenosv.org${localizedPath(`/listings/${listing.slug}`, locale)}`}
              locale={locale}
            />
            {listing.mapUrl && (
              <a
                href={listing.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
              >
                {dict.listingDetail.viewOnMap}
              </a>
            )}
          </div>

          <div className="mt-6 rounded-xl bg-surface p-5 shadow-panel">
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
                  className="inline-flex items-center gap-2 rounded-lg bg-success px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  {dict.listingDetail.whatsapp}
                </a>
              )}
              {mailtoUrl && (
                <a
                  href={mailtoUrl}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
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
          <ul className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-panel">
            {conversion.conversions.map((c) => (
              <li key={c.unit} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-foreground-muted">{unitLabels[c.unit][locale]}</span>
                <span className="text-right">
                  <span className="block font-mono text-sm font-semibold text-foreground">{formatAreaNumber(c.value)}</span>
                  {c.perUnitPrice != null && (
                    <span className="block text-xs text-foreground-muted">
                      ${formatUsdCurrency(c.perUnitPrice)}/{unitLabels[c.unit][locale]}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M3 12V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M11 12V8a1 1 0 0 1 1-1h6a2 2 0 0 1 2 2v3" />
    </svg>
  );
}
function BathIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM7 12V6a2 2 0 0 1 3.46-1.37M4 19l-.5 2M20 19l.5 2" />
    </svg>
  );
}
function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16V9.5a1 1 0 0 1 .3-.7L6 6h12l2.7 2.8a1 1 0 0 1 .3.7V16M3 16h18M3 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M18 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2M7 11h10" />
    </svg>
  );
}
