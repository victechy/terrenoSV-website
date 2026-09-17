"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Locale, getDictionary, localizedPath, otherLocale } from "@/lib/dictionary";

export default function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  const links = [
    { href: localizedPath("/listings", locale), label: dict.nav.listings },
    { href: localizedPath("/calculator", locale), label: dict.nav.calculator },
    { href: localizedPath("/book", locale), label: dict.nav.book },
  ];

  const isActive = (href: string) => pathname === href || pathname === `${href}/`;

  return (
    <header className="sticky top-0 z-40 bg-brand-blue">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href={localizedPath("/", locale)}
          className="flex items-center gap-2 shrink-0"
          onClick={() => setOpen(false)}
        >
          <Image src="/icon-nav.png" alt="" width={400} height={293} unoptimized className="h-8 w-auto sm:h-9" priority />
          <span className="font-brand text-2xl leading-none text-white">
            terreno<span className="text-accent">SV</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive(link.href) ? "text-white" : "text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href={localizedPath(pathname, otherLocale(locale))}
            className="text-sm font-medium text-white/70 hover:text-white"
          >
            {dict.nav.langSwitch}
          </Link>
          <Link
            href={localizedPath("/#app", locale)}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#1a202c] transition-colors hover:opacity-90"
          >
            {dict.nav.app}
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden rounded-md border border-white/30 p-2 text-white"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/15 bg-brand-blue px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2 text-sm font-medium ${
                  isActive(link.href) ? "bg-white/10 text-white" : "text-white/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={localizedPath(pathname, otherLocale(locale))}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-white/70"
            >
              {dict.nav.langSwitch}
            </Link>
            <Link
              href={localizedPath("/#app", locale)}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-[#1a202c]"
            >
              {dict.nav.app}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
