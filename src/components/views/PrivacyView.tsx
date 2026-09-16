import { Locale, getDictionary } from "@/lib/dictionary";

export default function PrivacyView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{dict.privacy.title}</h1>
      <p className="mt-2 text-sm text-foreground-muted">{dict.privacy.lastUpdated}</p>
      <p className="mt-4 text-foreground-muted">{dict.privacy.intro}</p>

      <div className="mt-8 space-y-8">
        {dict.privacy.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-1.5 text-foreground-muted">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
