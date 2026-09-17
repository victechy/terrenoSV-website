import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="font-brand text-3xl text-primary">
        terreno<span className="text-accent-warm">SV</span>
      </span>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-foreground-muted">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
      <Link href="/" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
        Back home
      </Link>
    </div>
  );
}
