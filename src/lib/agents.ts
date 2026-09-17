import { cache } from "react";
import { csvToRecords } from "./csv";

// A small admin-maintained allow-list: one row per approved realtor. Doubles
// as the auto-publish allow-list (see scripts/auto-publish-apps-script.gs) —
// same underlying "who do I trust" list, read two different ways.
const AGENTS_SHEET_ID = "19pUngke0awIXhpgYHl80uKF7AS97Xv4DcgqTCMPtrFU";
export const AGENTS_CSV_URL = `https://docs.google.com/spreadsheets/d/${AGENTS_SHEET_ID}/export?format=csv`;

export type Agent = {
  email: string;
  slug: string;
  displayName: string;
};

function mapAgentRow(row: Record<string, string>): Agent | null {
  const email = (row["Email"] || "").trim().toLowerCase();
  const slug = (row["Slug"] || "").trim().toLowerCase();
  const displayName = (row["Display Name"] || "").trim();
  if (!email || !slug || !displayName) return null;
  return { email, slug, displayName };
}

// Mirrors fetchListings' own retry/memoization shape (src/lib/listings.ts) —
// same "one flaky sheet fetch shouldn't blank a build" reasoning applies here.
export const fetchAgents = cache(async (): Promise<Agent[]> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${AGENTS_CSV_URL}&t=${Date.now()}`);
      if (!res.ok) throw new Error(`Agents sheet fetch failed: ${res.status}`);
      const csvText = await res.text();
      return csvToRecords(csvText)
        .map(mapAgentRow)
        .filter((a): a is Agent => a !== null);
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
});

export async function fetchAgentBySlug(slug: string): Promise<Agent | null> {
  const agents = await fetchAgents();
  const normalized = slug.trim().toLowerCase();
  return agents.find((a) => a.slug === normalized) ?? null;
}
