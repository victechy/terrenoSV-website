import Image from "next/image";
import Link from "next/link";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";

export default function BookView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="relative h-80 w-56 overflow-hidden rounded-xl shadow-card-hover">
        <Image src="/book-cover.png" alt="Moving to El Salvador" fill unoptimized className="object-cover" priority />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-accent-warm">{dict.bookPage.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{dict.bookPage.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-foreground-muted">{dict.bookPage.body}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="https://www.florespublishing.org/moving-to-el-salvador"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-card hover:bg-primary-hover"
          >
            {dict.bookPage.cta}
          </a>
          <Link
            href={localizedPath("/listings", locale)}
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
          >
            {dict.bookPage.listingsCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
