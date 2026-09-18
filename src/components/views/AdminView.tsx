"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Application,
  approveAgent,
  clearAdminToken,
  denyAgent,
  listApplications,
  loadAdminToken,
  requestLoginLink,
  saveAdminToken,
  verifyPortalToken,
} from "@/lib/portal";

const ADMIN_EMAIL = "vflores.sv@gmail.com";

type Phase = "loading" | "login" | "link-sent" | "unauthorized" | "dashboard";

export default function AdminView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("loading");
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [listError, setListError] = useState<string | null>(null);

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
    setPhase("login");
  };

  const handleDecided = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
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
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Agent applications</h1>
          <p className="mt-0.5 text-sm text-foreground-muted">Admin panel</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
        >
          Log out
        </button>
      </div>

      {listError && <p className="mt-6 text-sm text-red-600">{listError}</p>}

      {!listError && applications.length === 0 && (
        <p className="mt-10 text-center text-sm text-foreground-muted">No pending applications.</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} token={token!} onDecided={() => handleDecided(app.id)} />
        ))}
      </div>
    </div>
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
