import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/listings";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";
import ListingsTeaser from "../ListingsTeaser";
import CalculatorGlimpse from "../CalculatorGlimpse";
import NotifyForm from "../NotifyForm";

export default function HomeView({ locale, featured }: { locale: Locale; featured: Listing[] }) {
  const dict = getDictionary(locale);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent-warm to-primary"
        />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent-warm">
            {dict.hero.eyebrow}
          </p>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            {dict.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-foreground-muted">{dict.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localizedPath("/calculator", locale)}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-hover"
            >
              {dict.hero.ctaCalculator}
            </Link>
            <Link
              href={localizedPath("/listings", locale)}
              className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {dict.hero.ctaListings}
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator glimpse — the app's own flagship feature, leads the homepage same as the app's own onboarding does.
          Functional, not decorative: pasting here and hitting Calculate carries the text through to the full
          calculator page via a query param, same "small taste, then the real page" pattern as the listings teaser below. */}
      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-xl bg-surface p-8 shadow-panel">
          <CalculatorGlimpse locale={locale} />
        </div>
      </section>

      {/* Featured listings — a glimpse, same pattern as the calculator: full experience lives on /listings */}
      <section className="border-t border-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <ListingsTeaser
            locale={locale}
            listings={featured}
            title={dict.home.featuredTitle}
            subtitle={dict.home.featuredSubtitle}
            viewAllLabel={dict.home.viewAll}
            noListingsLabel={dict.home.noListings}
            count={3}
          />
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{dict.home.featuresTitle}</h2>
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
        <div className="flex flex-col items-start gap-8 rounded-2xl bg-primary px-8 py-12 text-white shadow-card sm:flex-row sm:items-center sm:px-12">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight">{dict.home.appPromoTitle}</h2>
            <p className="mt-3 max-w-lg text-white/85">{dict.home.appPromoBody}</p>
            <NotifyForm locale={locale} />
          </div>
        </div>
      </section>

      {/* Sell promo */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-start gap-8 rounded-2xl bg-surface px-8 py-12 shadow-panel sm:flex-row sm:items-center sm:px-12">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{dict.home.sellPromoTitle}</h2>
            <p className="mt-3 max-w-lg text-foreground-muted">{dict.home.sellPromoBody}</p>
            <Link
              href={localizedPath("/sell", locale)}
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {dict.home.sellPromoCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Book promo */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center gap-8 rounded-2xl bg-surface p-8 shadow-panel sm:flex-row sm:p-12">
          <div className="relative h-64 w-44 shrink-0 overflow-hidden rounded-xl shadow-card">
            <Image src="/book-cover.png" alt="Moving to El Salvador" fill unoptimized className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{dict.home.bookPromoTitle}</h2>
            <p className="mt-3 max-w-lg text-foreground-muted">{dict.home.bookPromoBody}</p>
            <Link
              href={localizedPath("/book", locale)}
              className="mt-6 inline-block rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
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
