import Image from "next/image";
import Link from "next/link";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue-dark">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Image src="/icon-nav.png" alt="" width={400} height={295} unoptimized className="h-7 w-auto" />
              <span className="font-brand text-xl text-white">
                terreno<span className="text-accent">SV</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70">{dict.footer.tagline}</p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-white">{dict.nav.home}</span>
              <Link href={localizedPath("/listings", locale)} className="text-white/70 hover:text-white">
                {dict.footer.listings}
              </Link>
              <Link href={localizedPath("/calculator", locale)} className="text-white/70 hover:text-white">
                {dict.footer.calculator}
              </Link>
              <Link href={localizedPath("/book", locale)} className="text-white/70 hover:text-white">
                {dict.footer.book}
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-white">{dict.footer.company}</span>
              <Link href={localizedPath("/about", locale)} className="text-white/70 hover:text-white">
                {dict.footer.about}
              </Link>
              <Link href={localizedPath("/glossary", locale)} className="text-white/70 hover:text-white">
                {dict.footer.glossary}
              </Link>
              <Link href={localizedPath("/sell", locale)} className="text-white/70 hover:text-white">
                {dict.footer.sell}
              </Link>
              <Link href={localizedPath("/privacy", locale)} className="text-white/70 hover:text-white">
                {dict.footer.privacy}
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-white">{dict.footer.contact}</span>
              <a href="mailto:hello@terrenosv.org" className="text-white/70 hover:text-white">
                hello@terrenosv.org
              </a>
              <a
                href="https://www.florespublishing.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white"
              >
                florespublishing.org
              </a>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-white/15 pt-6 text-xs text-white/60">
          © {year} terrenoSV. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
