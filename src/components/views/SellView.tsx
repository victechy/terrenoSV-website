import { Locale, getDictionary } from "@/lib/dictionary";

export default function SellView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const benefits = [
    { title: dict.sell.benefit1Title, body: dict.sell.benefit1Body },
    { title: dict.sell.benefit2Title, body: dict.sell.benefit2Body },
    { title: dict.sell.benefit3Title, body: dict.sell.benefit3Body },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{dict.sell.title}</h1>
      <p className="mt-3 text-lg font-medium text-primary">{dict.sell.subtitle}</p>
      <p className="mx-auto mt-4 max-w-xl text-foreground-muted">{dict.sell.body}</p>

      <a
        href={dict.sell.formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white hover:bg-primary-hover"
      >
        {dict.sell.cta}
      </a>

      <div className="mt-14 grid gap-6 text-left sm:grid-cols-3">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold text-foreground">{b.title}</h2>
            <p className="mt-1.5 text-sm text-foreground-muted">{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
