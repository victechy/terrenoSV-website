"use client";

import type { SellerStatus } from "./listings";

// Same Apps Script pattern as notify.ts / likes.ts — see
// scripts/seller-portal-apps-script.gs for the backend + setup steps.
// PLACEHOLDER: replace both after deploying that script.
const PORTAL_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyAhm1s44A0CDsuxFE_rI32qa-TQbQF9ULRCC2tyAp5v9GTuU4gbgiFWif-VzBqXmYxxQ/exec";
const PORTAL_SHARED_SECRET = "!A@S#D$F5g6h7j8kV1ctor@nni@";

const TOKEN_STORAGE_KEY = "terrenosv_portal_token";

async function callPortal<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(PORTAL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ ...body, secret: PORTAL_SHARED_SECRET }),
  });
  return res.json();
}

export async function requestLoginLink(email: string): Promise<{ success: boolean }> {
  try {
    const data = await callPortal<{ success: boolean }>({ action: "request-link", email });
    return { success: !!data.success };
  } catch {
    return { success: false };
  }
}

export async function verifyPortalToken(
  token: string
): Promise<{ success: true; email: string } | { success: false }> {
  try {
    const data = await callPortal<{ success: boolean; email?: string }>({
      action: "verify-token",
      token,
    });
    if (data.success && data.email) return { success: true, email: data.email };
    return { success: false };
  } catch {
    return { success: false };
  }
}

export async function updateListingStatus(
  token: string,
  listingId: string,
  status: Exclude<SellerStatus, "Active">
): Promise<{ success: boolean; error?: string }> {
  try {
    return await callPortal<{ success: boolean; error?: string }>({
      action: "update-status",
      token,
      listingId,
      status,
    });
  } catch {
    return { success: false, error: "network" };
  }
}

export type EditableListingFields = { price?: number; title?: string; description?: string };

export async function updateListingFields(
  token: string,
  listingId: string,
  fields: EditableListingFields
): Promise<{ success: boolean; error?: string }> {
  try {
    return await callPortal<{ success: boolean; error?: string }>({
      action: "update-fields",
      token,
      listingId,
      fields,
    });
  } catch {
    return { success: false, error: "network" };
  }
}

export type Application = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  experience: string;
  reason: string;
  social: string;
};

export async function listApplications(token: string): Promise<{ success: boolean; applications?: Application[]; error?: string }> {
  try {
    return await callPortal<{ success: boolean; applications?: Application[]; error?: string }>({
      action: "list-applications",
      token,
    });
  } catch {
    return { success: false, error: "network" };
  }
}

export async function approveAgent(token: string, applicationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await callPortal<{ success: boolean; error?: string }>({
      action: "approve-agent",
      token,
      applicationId,
    });
  } catch {
    return { success: false, error: "network" };
  }
}

export async function denyAgent(token: string, applicationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    return await callPortal<{ success: boolean; error?: string }>({
      action: "deny-agent",
      token,
      applicationId,
    });
  } catch {
    return { success: false, error: "network" };
  }
}

function loadToken(storageKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function saveToken(storageKey: string, token: string) {
  try {
    window.localStorage.setItem(storageKey, token);
  } catch {
    // storage unavailable (private browsing, quota) — still works for this session
  }
}

function clearToken(storageKey: string) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}

export const loadPortalToken = () => loadToken(TOKEN_STORAGE_KEY);
export const savePortalToken = (token: string) => saveToken(TOKEN_STORAGE_KEY, token);
export const clearPortalToken = () => clearToken(TOKEN_STORAGE_KEY);

// Separate storage key so an admin session and a seller session don't
// collide in the same browser (e.g. testing both as the same person).
const ADMIN_TOKEN_STORAGE_KEY = "terrenosv_admin_token";
export const loadAdminToken = () => loadToken(ADMIN_TOKEN_STORAGE_KEY);
export const saveAdminToken = (token: string) => saveToken(ADMIN_TOKEN_STORAGE_KEY, token);
export const clearAdminToken = () => clearToken(ADMIN_TOKEN_STORAGE_KEY);
