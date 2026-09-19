"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AdminListing,
  Application,
  approveAgent,
  clearAdminToken,
  denyAgent,
  listApplications,
  listListings,
  loadAdminToken,
  requestLoginLink,
  saveAdminToken,
  setListingStatus,
  triggerRebuild,
  verifyPortalToken,
} from "@/lib/portal";
import { getImageUrls } from "@/lib/listings";
import { formatUsdCurrency } from "@/lib/converter";

const ADMIN_EMAIL = "vflores.sv@gmail.com";

type Phase = "loading" | "login" | "link-sent" | "unauthorized" | "dashboard";
type Tab = "applications" | "listings";

export default function AdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("loading");
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [listError, setListError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("applications");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  useEffect(() => {
    // Deliberate: resolving auth state from localStorage/the URL is a
    // one-time hydration from an external source (same pattern as
    // useFavorites in lib/likes.ts), not a value derivable from props/state.
    const urlToken = searchParams.get("token");
    const stored = loadAdminToken();
    const candidate = urlToken || stored;

    if (!candidate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("login");
      return;
    }

    verifyPortalToken(candidate).then((res) => {
      if (!res.success || res.email !== ADMIN_EMAIL) {
        clearAdminToken();
        setPhase("unauthorized");
        return;
      }
      saveAdminToken(candidate);
      setToken(candidate);
      if (urlToken) router.replace("/admin");
      listApplications(candidate)
        .then((data) => {
          if (data.success) setApplications(data.applications || []);
          else setListError(data.error || "Couldn't load applications.");
        })
        .catch(() => setListError("Couldn't load applications."))
        .finally(() => setPhase("dashboard"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestLink = async () => {
    setSubmitting(true);
    await requestLoginLink(ADMIN_EMAIL);
    setSubmitting(false);
    setPhase("link-sent");
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
    setApplications([]);
    setListings([]);
    setListingsLoaded(false);
    setTab("applications");
    setPhase("login");
  };

  const handleDecided = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  // Lazy-loaded: only fetched the first time the Listings tab is opened,
  // not on every login (this list can get long, applications stays cheap).
  useEffect(() => {
    if (tab !== "listings" || listingsLoaded || !token) return;
    // Deliberate: kicking off the fetch triggered by the tab switch is the
    // whole point of this effect, and the loading flag has to flip before
    // the async call starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setListingsLoading(true);
    listListings(token)
      .then((data) => {
        if (data.success) setListings(data.listings || []);
        else setListingsError(data.error || "Couldn't load listings.");
      })
      .catch(() => setListingsError("Couldn't load listings."))
      .finally(() => {
        setListingsLoading(false);
        setListingsLoaded(true);
      });
  }, [tab, listingsLoaded, token]);

  const handleListingStatusChange = (id: string, status: "Yes" | "No") => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, publishedStatus: status } : l)));
  };

  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildMessage, setRebuildMessage] = useState<string | null>(null);

  const handleRebuild = async () => {
    setRebuilding(true);
    setRebuildMessage(null);
    const res = await triggerRebuild(token!);
    setRebuilding(false);
    setRebuildMessage(
      res.success ? "Rebuild started — usually live in a few minutes." : res.error || "Couldn't start rebuild."
    );
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-foreground-muted">Loading…</p>
      </div>
    );
  }

  if (phase !== "dashboard") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-panel text-center">
          <Link href="/" className="mb-6 flex justify-center font-brand text-2xl text-primary">
            terreno<span className="text-accent-warm">SV</span>
          </Link>

          {phase === "link-sent" && (
            <>
              <h1 className="text-lg font-bold text-foreground">Check your email</h1>
              <p className="mt-2 text-sm text-foreground-muted">
                We sent a login link to <strong className="text-foreground">{ADMIN_EMAIL}</strong>.
              </p>
            </>
          )}

          {phase === "unauthorized" && (
            <>
              <h1 className="text-lg font-bold text-foreground">Unauthorized</h1>
              <p className="mt-2 text-sm text-foreground-muted">
                This panel is for the terrenoSV administrator only.
              </p>
            </>
          )}

          {phase === "login" && (
            <>
              <h1 className="text-lg font-bold text-foreground">Admin panel</h1>
              <p className="mt-2 text-sm text-foreground-muted">Get a login link sent to {ADMIN_EMAIL}.</p>
              <button
                type="button"
                onClick={handleRequestLink}
                disabled={submitting}
                className="mt-6 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send login link"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Admin panel</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleRebuild}
            disabled={rebuilding}
            title="Publishes any pending approvals/rejections to the live site immediately, instead of waiting for the automatic 6-hour rebuild."
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {rebuilding ? "Rebuilding…" : "Rebuild site"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
          >
            Log out
          </button>
        </div>
      </div>

      {rebuildMessage && <p className="mt-2 text-sm text-foreground-muted">{rebuildMessage}</p>}

      <div className="mt-6 flex gap-2 border-b border-border">
        <TabButton active={tab === "applications"} onClick={() => setTab("applications")}>
          Agent applications
        </TabButton>
        <TabButton active={tab === "listings"} onClick={() => setTab("listings")}>
          Listings
        </TabButton>
      </div>

      {tab === "applications" ? (
        <>
          {listError && <p className="mt-6 text-sm text-red-600">{listError}</p>}

          {!listError && applications.length === 0 && (
            <p className="mt-10 text-center text-sm text-foreground-muted">No pending applications.</p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} token={token!} onDecided={() => handleDecided(app.id)} />
            ))}
          </div>
        </>
      ) : (
        <ListingsPanel
          listings={listings}
          loading={listingsLoading}
          error={listingsError}
          token={token!}
          onStatusChange={handleListingStatusChange}
        />
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

function ApplicationCard({
  application,
  token,
  onDecided,
}: {
  application: Application;
  token: string;
  onDecided: () => void;
}) {
  const [confirming, setConfirming] = useState<"approve" | "deny" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = `${application.firstName} ${application.lastName}`.trim() || application.email;

  const confirm = async (action: "approve" | "deny") => {
    setSaving(true);
    setError(null);
    const res = action === "approve" ? await approveAgent(token, application.id) : await denyAgent(token, application.id);
    setSaving(false);
    if (res.success) {
      onDecided();
    } else {
      setError(res.error || "Couldn't save. Try again.");
    }
  };

  return (
    <div className="rounded-xl bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{fullName}</p>
          <p className="text-sm text-foreground-muted">{application.email}</p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 border-t border-border pt-3 text-sm sm:grid-cols-2">
        {application.businessName && <Field label="Business/agency" value={application.businessName} />}
        {application.phone && <Field label="Phone" value={application.phone} />}
        {application.experience && <Field label="Experience" value={application.experience} />}
        {application.social && <Field label="Social/website" value={application.social} />}
      </dl>
      {application.reason && (
        <p className="mt-2 text-sm text-foreground-muted">
          <span className="font-medium text-foreground">Why they want to publish: </span>
          {application.reason}
        </p>
      )}

      {confirming ? (
        <div className="mt-4 rounded-lg bg-surface-muted p-3">
          <p className="text-sm text-foreground">
            Confirm {confirming === "approve" ? "approving" : "denying"} <strong>{fullName}</strong>?
            {confirming === "approve" && " They'll be added to your agents list with auto-publish enabled."}
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => confirm(confirming)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Yes, confirm"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirming(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming("approve")}
            className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => setConfirming("deny")}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted hover:border-red-400 hover:text-red-600"
          >
            Deny
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-foreground-muted">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

type StatusFilter = "pending" | "Yes" | "No" | "all";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "Yes", label: "Published" },
  { key: "No", label: "Rejected" },
  { key: "all", label: "All" },
];

function ListingsPanel({
  listings,
  loading,
  error,
  token,
  onStatusChange,
}: {
  listings: AdminListing[];
  loading: boolean;
  error: string | null;
  token: string;
  onStatusChange: (id: string, status: "Yes" | "No") => void;
}) {
  const [search, setSearch] = useState("");
  // Defaults to "pending" — with a sheet that can hold hundreds of historical
  // rows, browsing everything by default buries the ones that actually need
  // a decision.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  const byStatus =
    statusFilter === "all"
      ? listings
      : statusFilter === "pending"
        ? listings.filter((l) => l.publishedStatus !== "Yes" && l.publishedStatus !== "No")
        : listings.filter((l) => l.publishedStatus === statusFilter);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? byStatus.filter(
        (l) =>
          l.sellerName.toLowerCase().includes(q) ||
          l.sellerEmail.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q)
      )
    : byStatus;

  return (
    <div className="mt-6">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by agent name, email, or title…"
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              statusFilter === f.key
                ? "bg-primary text-white"
                : "border border-border text-foreground-muted hover:border-primary hover:text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-10 text-center text-sm text-foreground-muted">Loading…</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-foreground-muted">No listings match.</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {filtered.map((listing) => (
          <AdminListingRow key={listing.id} listing={listing} token={token} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}

// Matches PENDING_MARKER_PREFIX in seller-portal-apps-script.gs — when an
// agent fixes a previously-rejected listing, the portal writes this back
// into Published Status instead of a plain blank, so the admin can tell a
// resubmission apart from a listing that's never been reviewed at all.
const PENDING_MARKER_PREFIX = "Pending: ";
const CHANGE_TYPE_LABELS: Record<string, string> = {
  photos: "photos updated",
  details: "price/title/description updated",
};

function listingStatusBadge(publishedStatus: string): { label: string; className: string } {
  if (publishedStatus === "Yes") return { label: "Published", className: "bg-success/15 text-success" };
  if (publishedStatus === "No") return { label: "Rejected", className: "bg-red-100 text-red-700" };

  if (publishedStatus.startsWith(PENDING_MARKER_PREFIX)) {
    const types = publishedStatus
      .slice(PENDING_MARKER_PREFIX.length)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => CHANGE_TYPE_LABELS[t] || t);
    return { label: `Resubmitted · ${types.join(" and ")}`, className: "bg-amber-100 text-amber-800" };
  }

  return { label: "New — never reviewed", className: "bg-amber-100 text-amber-800" };
}

function AdminListingRow({
  listing,
  token,
  onStatusChange,
}: {
  listing: AdminListing;
  token: string;
  onStatusChange: (id: string, status: "Yes" | "No") => void;
}) {
  const [saving, setSaving] = useState<"Yes" | "No" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const photos = getImageUrls(listing.photosRaw);
  const photo = photos[0];
  const statusMeta = listingStatusBadge(listing.publishedStatus);
  const priceNumber = parseFloat(listing.price);

  const handleSetStatus = async (status: "Yes" | "No") => {
    setSaving(status);
    setError(null);
    const res = await setListingStatus(token, listing.id, status);
    setSaving(null);
    if (res.success) {
      onStatusChange(listing.id, status);
    } else {
      setError(res.error || "Couldn't save. Try again.");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-3 p-3 text-left"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
          {photo ? <Image src={photo} alt="" fill unoptimized className="object-cover" sizes="64px" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
            <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${statusMeta.className}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="truncate text-sm text-foreground-muted">
            {listing.sellerName || "—"} · {listing.sellerEmail}
          </p>
          <p className="mt-0.5 text-sm text-foreground-muted">
            {Number.isFinite(priceNumber) && priceNumber > 0 ? `$${formatUsdCurrency(priceNumber)}` : "No price"}
            {" · "}
            {[listing.municipality, listing.department].filter(Boolean).join(", ")}
            {listing.sellerStatus && listing.sellerStatus !== "Active" ? ` · ${listing.sellerStatus}` : ""}
          </p>
        </div>

        <ChevronIcon expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-3">
          <div className="flex flex-wrap gap-2">
            {photos.length > 0 ? (
              photos.map((p, i) => (
                <a
                  key={p + i}
                  href={p}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image src={p} alt="" fill unoptimized className="object-cover" sizes="80px" />
                </a>
              ))
            ) : (
              <p className="text-sm text-foreground-muted">No photos.</p>
            )}
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <dt className="text-foreground-muted">Property type</dt>
            <dd className="text-foreground">{listing.propertyType || "—"}</dd>
            <dt className="text-foreground-muted">Transaction</dt>
            <dd className="text-foreground">{listing.transaction || "—"}</dd>
          </dl>

          {listing.description && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{listing.description}</p>
          )}
        </div>
      )}

      {error && <p className="px-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 px-3 pb-3 pt-2">
        <button
          type="button"
          disabled={saving !== null}
          onClick={() => handleSetStatus("Yes")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
            listing.publishedStatus === "Yes"
              ? "bg-success text-white"
              : "border border-border text-foreground-muted hover:border-success hover:text-success"
          }`}
        >
          {saving === "Yes" ? "Saving…" : "Yes"}
        </button>
        <button
          type="button"
          disabled={saving !== null}
          onClick={() => handleSetStatus("No")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
            listing.publishedStatus === "No"
              ? "bg-red-600 text-white"
              : "border border-border text-foreground-muted hover:border-red-400 hover:text-red-600"
          }`}
        >
          {saving === "No" ? "Saving…" : "No"}
        </button>
      </div>
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
      className={`mt-1 shrink-0 text-foreground-muted transition-transform ${expanded ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}
