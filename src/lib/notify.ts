"use client";

import type { Locale } from "./dictionary";

const NOTIFY_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbylNy2yCz9K6UPEdmkhKTFhktpMRgV4C-MVqPcnT9h9XSvoAGIeqYaUn_xYWGruK_4u/exec";
const NOTIFY_SHARED_SECRET = "W5bbbYm9EVPNZUHgY6zQEaHCvpHWDSR";

export type NotifyResult = { success: true; alreadySubscribed?: boolean } | { success: false; error: string };

export async function subscribeToLaunch(email: string, honeypot: string, locale: Locale): Promise<NotifyResult> {
  try {
    const res = await fetch(NOTIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ email, hp: honeypot, locale, secret: NOTIFY_SHARED_SECRET }),
    });
    return await res.json();
  } catch {
    return { success: false, error: "network" };
  }
}
