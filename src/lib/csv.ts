/**
 * Minimal RFC4180 CSV parser — handles quoted fields, embedded commas,
 * escaped quotes ("") and both \n and \r\n line endings. Google Sheets'
 * CSV export needs exactly this (descriptions routinely contain commas).
 */
export function parseCSV(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // skip, \n handles the line break
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/** Rows as header-keyed objects, dropping any row whose column count drifts. */
export function csvToRecords(input: string): Record<string, string>[] {
  const rows = parseCSV(input).filter((r) => r.some((cell) => cell.trim() !== ""));
  if (rows.length === 0) return [];
  const [headers, ...data] = rows;
  return data
    .filter((r) => r.length === headers.length)
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}
