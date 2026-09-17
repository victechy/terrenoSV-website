"use client";

import { useState } from "react";
import { Locale, getDictionary } from "@/lib/dictionary";

export default function ShareButton({ text, url, locale }: { text: string; url: string; locale: Locale }) {
  const dict = getDictionary(locale);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const fullText = `${text} ${url}`;
    // Mirrors the app's share.js: native share sheet where available, clipboard
    // copy as the fallback everywhere else (most desktop browsers included).
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        // user cancelled the share sheet — not an error
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
    >
      <ShareIcon />
      {copied ? dict.listingDetail.linkCopied : dict.listingDetail.share}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"
      />
    </svg>
  );
}
