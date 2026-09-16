import Image from "next/image";
import Link from "next/link";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Image src="/logo-icon.png" alt="" width={28} height={28} unoptimized className="rounded-md" />
              <span className="font-brand text-xl text-primary">
                terreno<span className="text-accent-warm">SV</span>
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground-muted">{dict.footer.tagline}</p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-foreground">{dict.nav.home}</span>
              <Link href={localizedPath("/listings", locale)} className="text-foreground-muted hover:text-primary">
                {dict.footer.listings}
              </Link>
              <Link href={localizedPath("/calculator", locale)} className="text-foreground-muted hover:text-primary">
                {dict.footer.calculator}
              </Link>
              <Link href={localizedPath("/book", locale)} className="text-foreground-muted hover:text-primary">
                {dict.footer.book}
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-foreground">{dict.footer.contact}</span>
              <a href="mailto:vflores.sv@gmail.com" className="text-foreground-muted hover:text-primary">
                vflores.sv@gmail.com
              </a>
              <a
                href="https://www.florespublishing.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-muted hover:text-primary"
              >
                florespublishing.org
              </a>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-xs text-foreground-muted">
          © {year} terrenoSV. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
