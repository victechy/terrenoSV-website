import Link from "next/link";
import { Agent } from "@/lib/agents";
import { Listing, formatPhoneForWhatsApp } from "@/lib/listings";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";
import ListingCard from "../ListingCard";

export default function AgentView({
  agent,
  listings,
  locale,
}: {
  agent: Agent;
  listings: Listing[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);

  // Every listing a seller submits carries their own contact details, so any
  // of theirs works — first one found is enough.
  const contactPhone = listings.find((l) => l.contactPhone)?.contactPhone;
  const contactEmail = listings.find((l) => l.contactEmail)?.contactEmail;
  const whatsappPhone = formatPhoneForWhatsApp(contactPhone);
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone.replace("+", "")}?text=${encodeURIComponent(dict.agent.contactMessage)}`
    : null;
  const mailtoUrl = contactEmail
    ? `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(dict.agent.contactMessage)}`
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {agent.displayName}
        </h1>
        <p className="mt-2 text-foreground-muted">{dict.agent.subtitle}</p>
        {listings.length > 0 && (
          <p className="mt-1 text-sm font-semibold text-primary">{dict.agent.listingsCount(listings.length)}</p>
        )}

        {(whatsappUrl || mailtoUrl) && (
          <div className="mt-5 flex flex-wrap gap-3">
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
        )}
      </div>

      {listings.length === 0 ? (
        <p className="mt-10 text-center text-foreground-muted">{dict.agent.noListings}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} locale={locale} />
          ))}
        </div>
      )}

      <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl bg-surface p-8 shadow-panel sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{dict.agent.viewMoreTitle}</h2>
          <p className="mt-1 text-sm text-foreground-muted">{dict.agent.viewMoreBody}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href={localizedPath("/calculator", locale)}
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {dict.agent.calculatorCta}
          </Link>
          <Link
            href={localizedPath("/listings", locale)}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {dict.agent.viewMoreCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
