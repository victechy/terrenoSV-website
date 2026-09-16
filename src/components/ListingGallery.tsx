"use client";

import Image from "next/image";
import { useState } from "react";

export default function ListingGallery({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-surface-muted text-foreground-muted">
        No photos available
      </div>
    );
  }

  const go = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-muted">
        <Image
          key={photos[index]}
          src={photos[index]}
          alt={`${title} — photo ${index + 1} of ${photos.length}`}
          fill
          unoptimized
          className="object-cover"
          sizes="(min-width: 1024px) 720px, 100vw"
          priority
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((p, i) => (
                <button
                  key={p + i}
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((p, i) => (
            <button
              key={p + i}
              onClick={() => setIndex(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === index ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={p} alt="" fill unoptimized className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
