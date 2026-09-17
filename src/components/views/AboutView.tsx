import Link from "next/link";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";

export default function AboutView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{dict.about.title}</h1>
      <p className="mt-6 text-lg text-foreground-muted">{dict.about.body}</p>

      <div className="mt-8 rounded-xl bg-surface p-6 shadow-panel">
        <h2 className="text-lg font-semibold text-foreground">{dict.about.missionTitle}</h2>
        <p className="mt-2 text-foreground-muted">{dict.about.missionText}</p>
      </div>

      <p className="mt-6 text-sm text-foreground-muted">{dict.about.verificationNote}</p>
      <p className="mt-2 text-sm italic text-foreground-muted">{dict.about.developedWith}</p>

      <Link
        href={localizedPath("/listings", locale)}
        className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        {dict.about.cta}
      </Link>
    </div>
  );
}
