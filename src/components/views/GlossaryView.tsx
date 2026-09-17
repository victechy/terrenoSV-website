import Link from "next/link";
import { Locale, getDictionary, localizedPath } from "@/lib/dictionary";

export default function GlossaryView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{dict.glossary.title}</h1>
      <p className="mt-4 text-lg text-foreground-muted">{dict.glossary.subtitle}</p>

      <dl className="mt-8 divide-y divide-border rounded-xl bg-surface shadow-panel">
        {dict.glossary.items.map((item) => (
          <div key={item.unit} className="p-6">
            <dt className="font-semibold text-primary">{item.unit}</dt>
            <dd className="mt-1 text-foreground-muted">{item.body}</dd>
          </div>
        ))}
      </dl>

      <Link
        href={localizedPath("/calculator", locale)}
        className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        {dict.glossary.cta}
      </Link>
    </div>
  );
}
