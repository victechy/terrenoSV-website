"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Single root layout renders one <html> for both locale trees (no middleware
// in a static export to split them at the server), so the lang attribute is
// kept correct client-side instead — negligible for crawlers, who read the
// per-page hreflang alternates, but right for screen readers on load.
export default function HtmlLangSync() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = pathname?.startsWith("/es") ? "es" : "en";
  }, [pathname]);
  return null;
}
