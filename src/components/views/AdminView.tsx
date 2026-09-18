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
          else setListError(data.error || "No se pudieron cargar las solicitudes.");
        })
        .catch(() => setListError("No se pudieron cargar las solicitudes."))
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
        <p className="text-sm text-foreground-muted">Cargando…</p>
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
              <h1 className="text-lg font-bold text-foreground">Revisa tu correo</h1>
              <p className="mt-2 text-sm text-foreground-muted">
                Te enviamos un enlace de acceso a <strong className="text-foreground">{ADMIN_EMAIL}</strong>.
              </p>
            </>
          )}

          {phase === "unauthorized" && (
            <>
              <h1 className="text-lg font-bold text-foreground">Acceso no autorizado</h1>
              <p className="mt-2 text-sm text-foreground-muted">
                Este panel es solo para el administrador de terrenoSV.
              </p>
            </>
          )}

          {phase === "login" && (
            <>
              <h1 className="text-lg font-bold text-foreground">Panel de administrador</h1>
              <p className="mt-2 text-sm text-foreground-muted">
                Recibe un enlace de acceso en {ADMIN_EMAIL}.
              </p>
              <button
                type="button"
                onClick={handleRequestLink}
                disabled={submitting}
                className="mt-6 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {submitting ? "Enviando…" : "Enviar enlace de acceso"}
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
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Solicitudes de agentes</h1>
          <p className="mt-0.5 text-sm text-foreground-muted">Panel de administrador</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground-muted hover:border-primary hover:text-primary"
        >
          Cerrar sesión
        </button>
      </div>

      {listError && <p className="mt-6 text-sm text-red-600">{listError}</p>}

      {!listError && applications.length === 0 && (
        <p className="mt-10 text-center text-sm text-foreground-muted">No hay solicitudes pendientes.</p>
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
      setError(res.error || "No se pudo guardar. Intenta de nuevo.");
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
        {application.businessName && (
          <Field label="Empresa/agencia" value={application.businessName} />
        )}
        {application.phone && <Field label="Teléfono" value={application.phone} />}
        {application.experience && <Field label="Experiencia" value={application.experience} />}
        {application.social && <Field label="Redes/sitio" value={application.social} />}
      </dl>
      {application.reason && (
        <p className="mt-2 text-sm text-foreground-muted">
          <span className="font-medium text-foreground">Por qué quiere publicar: </span>
          {application.reason}
        </p>
      )}

      {confirming ? (
        <div className="mt-4 rounded-lg bg-surface-muted p-3">
          <p className="text-sm text-foreground">
            ¿Confirmas {confirming === "approve" ? "aprobar" : "rechazar"} a <strong>{fullName}</strong>?
            {confirming === "approve" && " Se agregará a tu lista de agentes con publicación automática."}
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => confirm(confirming)}
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
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming("approve")}
            className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Aprobar
          </button>
          <button
            type="button"
            onClick={() => setConfirming("deny")}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-muted hover:border-red-400 hover:text-red-600"
          >
            Rechazar
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
