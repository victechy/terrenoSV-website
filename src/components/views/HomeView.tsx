import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/listings";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";
import ListingCard from "../ListingCard";

export default function HomeView({ locale, featured }: { locale: Locale; featured: Listing[] }) {
  const dict = getDictionary(locale);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-warm">
            {dict.hero.eyebrow}
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {dict.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-foreground-muted">{dict.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizedPath("/listings", locale)}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {dict.hero.ctaListings}
            </Link>
            <Link
              href={localizedPath("/calculator", locale)}
              className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {dict.hero.ctaCalculator}
            </Link>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{dict.home.featuredTitle}</h2>
            <p className="mt-1 text-foreground-muted">{dict.home.featuredSubtitle}</p>
          </div>
          <Link
            href={localizedPath("/listings", locale)}
            className="hidden text-sm font-semibold text-primary hover:underline sm:block"
          >
            {dict.home.viewAll} →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-10 text-foreground-muted">{dict.home.noListings}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} locale={locale} />
            ))}
          </div>
        )}

        <Link
          href={localizedPath("/listings", locale)}
          className="mt-8 block text-center text-sm font-semibold text-primary hover:underline sm:hidden"
        >
          {dict.home.viewAll} →
        </Link>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">{dict.home.featuresTitle}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Feature
              icon={<HomeIcon />}
              title={dict.home.feature1Title}
              body={dict.home.feature1Body}
            />
            <Feature
              icon={<CalcIcon />}
              title={dict.home.feature2Title}
              body={dict.home.feature2Body}
            />
            <Feature
              icon={<ChatIcon />}
              title={dict.home.feature3Title}
              body={dict.home.feature3Body}
            />
          </div>
        </div>
      </section>

      {/* App promo */}
      <section id="app" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-start gap-8 rounded-3xl bg-primary px-8 py-12 text-white sm:flex-row sm:items-center sm:px-12">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{dict.home.appPromoTitle}</h2>
            <p className="mt-3 max-w-lg text-white/85">{dict.home.appPromoBody}</p>
            <a
              href="mailto:vflores.sv@gmail.com?subject=terrenoSV%20app%20launch"
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#1a202c] transition-transform hover:scale-105"
            >
              {dict.home.appPromoCta}
            </a>
          </div>
        </div>
      </section>

      {/* Book promo */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-surface p-8 sm:flex-row sm:p-12">
          <div className="relative h-64 w-44 shrink-0 overflow-hidden rounded-xl shadow-lg">
            <Image src="/book-cover.png" alt="Moving to El Salvador" fill unoptimized className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{dict.home.bookPromoTitle}</h2>
            <p className="mt-3 max-w-lg text-foreground-muted">{dict.home.bookPromoBody}</p>
            <Link
              href={localizedPath("/book", locale)}
              className="mt-6 inline-block rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {dict.home.bookPromoCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-foreground-muted">{body}</p>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-5 9 5v13M3 21h18M9 21v-6h6v6" />
    </svg>
  );
}
function CalcIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path strokeLinecap="round" d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}
