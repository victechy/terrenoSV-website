"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OwnerListing, SellerStatus, fetchOwnerListings } from "@/lib/listings";
import { fetchAgents } from "@/lib/agents";
import { formatUsdCurrency } from "@/lib/converter";
import {
  EditableListingFields,
  clearPortalToken,
  loadPortalToken,
  requestLoginLink,
  savePortalToken,
  updateListingFields,
  updateListingStatus,
  verifyPortalToken,
} from "@/lib/portal";
import ShareButton from "../ShareButton";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "loading" | "login" | "link-sent" | "dashboard";

function firstNameFrom(listings: OwnerListing[]): string | null {
  const fullName = listings.find((l) => l.sellerName.trim())?.sellerName.trim();
  return fullName ? fullName.split(/\s+/)[0] : null;
}

export default function PortalView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [agentSlug, setAgentSlug] = useState<string | null>(null);

  useEffect(() => {
    // Deliberate: resolving auth state from localStorage/the URL is a
    // one-time hydration from an external source (same pattern as
    // useFavorites in lib/likes.ts), not a value derivable from props/state.
    const urlToken = searchParams.get("token");
    const stored = loadPortalToken();
    const candidate = urlToken || stored;

    if (!candidate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("login");
      return;
    }

    verifyPortalToken(candidate).then((res) => {
      if (!res.success) {
        clearPortalToken();
        setPhase("login");
        return;
      }
      savePortalToken(candidate);
      setToken(candidate);
      setSessionEmail(res.email);
      if (urlToken) router.replace("/portal");
      fetchOwnerListings(res.email)
        .then((rows) => setListings(rows))
        .catch(() => setListError("No pudimos cargar tus publicaciones. Intenta de nuevo."))
        .finally(() => setPhase("dashboard"));
      // Best-effort: no public agent page yet just means the "share" tab
      // shows its own explanatory empty state instead of a link.
      fetchAgents()
        .then((agents) => {
          const match = agents.find((a) => a.email === res.email);
          if (match) setAgentSlug(match.slug);
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) return;
    setSubmitting(true);
    await requestLoginLink(email.trim());
    setSubmitting(false);
    setPhase("link-sent");
  };

  const handleLogout = () => {
    clearPortalToken();
    setToken(null);
    setSessionEmail(null);
    setListings([]);
    setExpandedId(null);
    setPhase("login");
  };

  const handleStatusChange = (id: string, status: Exclude<SellerStatus, "Active">) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, sellerStatus: status } : l)));
  };

  const handleFieldsChange = (id: string, fields: EditableListingFields) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...fields } : l)));
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-foreground-muted">Cargando…</p>
      </div>
    );
  }

  if (phase === "login" || phase === "link-sent") {
    return (
      <LoginScreen
        email={email}
        setEmail={setEmail}
        submitting={submitting}
        phase={phase}
        onSubmit={handleRequestLink}
      />
    );
  }

  return (
    <Dashboard
      email={sessionEmail!}
      firstName={firstNameFrom(listings)}
      token={token!}
      listings={listings}
      listError={listError}
      expandedId={expandedId}
      setExpandedId={setExpandedId}
      onStatusChange={handleStatusChange}
      onFieldsChange={handleFieldsChange}
      onLogout={handleLogout}
      agentSlug={agentSlug}
    />
  );
}

function LoginScreen({
  email,
  setEmail,
  submitting,
  phase,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  submitting: boolean;
  phase: Phase;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-panel">
        <Link href="/" className="mb-6 flex justify-center font-brand text-2xl text-primary">
          terreno<span className="text-accent-warm">SV</span>
        </Link>

        {phase === "link-sent" ? (
          <div className="text-center">
            <h1 className="text-lg font-bold text-foreground">Revisa tu correo</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Si <strong className="text-foreground">{email}</strong> tiene publicaciones con nosotros, te
              enviamos un enlace de acceso.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-center text-lg font-bold text-foreground">Portal de vendedores</h1>
            <p className="mt-2 text-center text-sm text-foreground-muted">
              Ingresa el correo con el que publicaste para recibir un enlace de acceso.
            </p>
            <form onSubmit={onSubmit} className="mt-6">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {submitting ? "Enviando…" : "Enviar enlace de acceso"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const STATUS_META: Record<
  "pending-approval" | "live" | "Pending Sale" | "Sold" | "Removed",
  { label: string; className: string }
> = {
  "pending-approval": { label: "Pendiente de aprobación", className: "bg-amber-100 text-amber-800" },
  live: { label: "Publicado", className: "bg-success/15 text-success" },
  "Pending Sale": { label: "Pendiente de venta", className: "bg-orange-100 text-orange-800" },
  Sold: { label: "Vendido", className: "bg-slate-200 text-slate-700" },
  Removed: { label: "Eliminado", className: "bg-red-100 text-red-700" },
};

function statusKey(listing: OwnerListing): keyof typeof STATUS_META {
  if (listing.sellerStatus !== "Active") return listing.sellerStatus;
  return listing.publishedStatus === "Yes" ? "live" : "pending-approval";
}

function canChangeStatus(listing: OwnerListing): boolean {
  return listing.sellerStatus === "Active" || listing.sellerStatus === "Pending Sale";
}

type Tab = "listings" | "share";

function Dashboard({
  email,
  firstName,
  token,
  listings,
  listError,
  expandedId,
  setExpandedId,
  onStatusChange,
  onFieldsChange,
  onLogout,
  agentSlug,
}: {
  email: string;
  firstName: string | null;
  token: string;
  listings: OwnerListing[];
  listError: string | null;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onStatusChange: (id: string, status: Exclude<SellerStatus, "Active">) => void;
  onFieldsChange: (id: string, fields: EditableListingFields) => void;
  onLogout: () => void;
  agentSlug: string | null;
}) {
  const [tab, setTab] = useState<Tab>("listings");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            {firstName ? `¡Hola, ${firstName}!` : "¡Hola!"}
          </h1>
          <p className="mt-0.5 text-sm text-foreground-muted">{email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        <TabButton active={tab === "listings"} onClick={() => setTab("listings")}>
          Mis publicaciones
        </TabButton>
        <TabButton active={tab === "share"} onClick={() => setTab("share")}>
          Compartir mis publicaciones
        </TabButton>
      </div>

      {tab === "listings" ? (
        <>
          {listError && <p className="mt-6 text-sm text-red-600">{listError}</p>}

          {!listError && listings.length === 0 && (
            <p className="mt-10 text-center text-sm text-foreground-muted">
              No encontramos publicaciones con este correo.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {listings.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                token={token}
                expanded={expandedId === listing.id}
                onToggle={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
                onStatusChange={onStatusChange}
                onFieldsChange={onFieldsChange}
              />
            ))}
          </div>
        </>
      ) : (
        <ShareTab agentSlug={agentSlug} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
        active ? "border-primary text-primary" : "border-transparent text-foreground-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ShareTab({ agentSlug }: { agentSlug: string | null }) {
  if (!agentSlug) {
    return (
      <div className="mt-6 rounded-xl bg-surface p-6 text-sm text-foreground-muted shadow-panel">
        Tu página pública para compartir tus publicaciones aún no está activada. Contáctanos para activarla.
      </div>
    );
  }

  const url = `https://terrenosv.org/es/agent/${agentSlug}`;

  return (
    <div className="mt-6 rounded-xl bg-surface p-6 shadow-panel">
      <h2 className="font-semibold text-foreground">Tu página de publicaciones</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Comparte este enlace con tus clientes. Muestra todas tus publicaciones activas, con la opción de ver
        más propiedades o usar la calculadora al final.
      </p>
      <p className="mt-4 truncate rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground-muted">
        {url}
      </p>
      <div className="mt-4">
        <ShareButton text="Mira mis publicaciones en terrenoSV" url={url} locale="es" />
      </div>
    </div>
  );
}

function ListingRow({
  listing,
  token,
  expanded,
  onToggle,
  onStatusChange,
  onFieldsChange,
}: {
  listing: OwnerListing;
  token: string;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: Exclude<SellerStatus, "Active">) => void;
  onFieldsChange: (id: string, fields: EditableListingFields) => void;
}) {
  const [editing, setEditing] = useState(false);
  const meta = STATUS_META[statusKey(listing)];

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-card">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 p-3 text-left">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
          {listing.photo ? (
            <Image src={listing.photo} alt="" fill unoptimized className="object-cover" sizes="56px" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
          <p className="mt-0.5 text-sm text-foreground-muted">
            {listing.price ? `$${formatUsdCurrency(listing.price)}` : "Sin precio"}
          </p>
        </div>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
          {meta.label}
        </span>
        <ChevronIcon expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-border p-4">
          {editing ? (
            <EditForm
              listing={listing}
              token={token}
              onCancel={() => setEditing(false)}
              onSaved={(fields) => {
                onFieldsChange(listing.id, fields);
                setEditing(false);
              }}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {canChangeStatus(listing) && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="self-start text-sm font-semibold text-primary hover:underline"
                >
                  Editar título, precio o descripción
                </button>
              )}
              <ListingActions listing={listing} token={token} onStatusChange={onStatusChange} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EditForm({
  listing,
  token,
  onCancel,
  onSaved,
}: {
  listing: OwnerListing;
  token: string;
  onCancel: () => void;
  onSaved: (fields: EditableListingFields) => void;
}) {
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(listing.price != null ? String(listing.price) : "");
  const [description, setDescription] = useState(listing.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("El título no puede estar vacío.");
      return;
    }

    const fields: EditableListingFields = { title: trimmedTitle, description: description.trim() };
    if (price.trim()) {
      const numericPrice = parseFloat(price.replace(/,/g, ""));
      if (!isFinite(numericPrice) || numericPrice <= 0) {
        setError("Ingresa un precio válido.");
        return;
      }
      fields.price = numericPrice;
    }

    setSaving(true);
    setError(null);
    const res = await updateListingFields(token, listing.id, fields);
    setSaving(false);
    if (res.success) {
      onSaved(fields);
    } else {
      setError(res.error || "No se pudo guardar. Intenta de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground-muted">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground-muted">Precio (USD)</label>
        <input
          type="text"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Sin precio"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground-muted">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={5000}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

const ACTION_LABELS: Record<Exclude<SellerStatus, "Active">, string> = {
  "Pending Sale": "Marcar pendiente de venta",
  Sold: "Marcar como vendido",
  Removed: "Eliminar publicación",
};

function ListingActions({
  listing,
  token,
  onStatusChange,
}: {
  listing: OwnerListing;
  token: string;
  onStatusChange: (id: string, status: Exclude<SellerStatus, "Active">) => void;
}) {
  const [confirming, setConfirming] = useState<Exclude<SellerStatus, "Active"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canChangeStatus(listing)) {
    return (
      <p className="text-sm text-foreground-muted">
        Esta publicación ya no se puede modificar desde aquí. Si necesitas volver a publicarla, contáctanos.
      </p>
    );
  }

  const available: Exclude<SellerStatus, "Active">[] =
    listing.sellerStatus === "Active" ? ["Pending Sale", "Sold", "Removed"] : ["Sold", "Removed"];

  const confirmChange = async (status: Exclude<SellerStatus, "Active">) => {
    setSaving(true);
    setError(null);
    const res = await updateListingStatus(token, listing.id, status);
    setSaving(false);
    if (res.success) {
      onStatusChange(listing.id, status);
      setConfirming(null);
    } else {
      setError(res.error || "No se pudo guardar. Intenta de nuevo.");
    }
  };

  if (confirming) {
    return (
      <div className="rounded-lg bg-surface-muted p-3">
        <p className="text-sm text-foreground">
          ¿Confirmas: <strong>{ACTION_LABELS[confirming]}</strong>? Esto la quita del sitio y no se puede
          deshacer desde aquí.
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => confirmChange(confirming)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Sí, confirmar"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => setConfirming(null)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => setConfirming(status)}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
        >
          {ACTION_LABELS[status]}
        </button>
      ))}
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 text-foreground-muted transition-transform ${expanded ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}
