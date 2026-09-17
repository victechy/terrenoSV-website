"use client";

import { useState } from "react";
import { Locale, getDictionary } from "@/lib/dictionary";
import { subscribeToLaunch } from "@/lib/notify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "already" | "invalid" | "error";

export default function NotifyForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    const result = await subscribeToLaunch(email.trim(), honeypot);
    if (!result.success) {
      setStatus("error");
    } else if (result.alreadySubscribed) {
      setStatus("already");
    } else {
      setStatus("success");
    }
  };

  if (status === "success" || status === "already") {
    return (
      <p className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#1a202c]">
        {status === "success" ? dict.home.notifySuccess : dict.home.notifyAlready}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={dict.home.notifyPlaceholder}
          className="w-full max-w-xs rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-white sm:w-64"
        />
        {/* Honeypot: hidden from real visitors via CSS, invisible to screen
            readers via aria-hidden + tabIndex — a bot filling forms
            programmatically fills it anyway. */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#1a202c] transition-transform hover:scale-105 disabled:opacity-60"
        >
          {dict.home.notifyButton}
        </button>
      </div>
      {(status === "invalid" || status === "error") && (
        <p className="mt-2 text-sm text-accent-warm">
          {status === "invalid" ? dict.home.notifyInvalid : dict.home.notifyError}
        </p>
      )}
    </form>
  );
}
