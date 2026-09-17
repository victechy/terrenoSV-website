// terrenoSV — Auto-publish new submissions from realtors you've already
// vetted, instead of waiting on manual "Published Status" approval.
//
// Bound directly to the LISTINGS sheet (not a new blank one, unlike the
// other two scripts in this folder) — it only needs to react to new rows
// landing there, no Web App deployment involved.
//
// Setup:
// 1. Create a NEW blank Google Sheet for the "Agents" allow-list (keep it
//    separate from the listings sheet, same reasoning as the other scripts
//    here — no reason to mix this into the publicly CSV-exported one).
//    Header row: "Email" in A1, "Slug" in B1, "Display Name" in C1,
//    "Auto Publish" in D1.
//      - Slug: the public URL segment, e.g. "juan-perez" -> /agent/juan-perez
//      - Display Name: shown on that public page, e.g. "Juan Pérez"
//      - Auto Publish: set to exactly "Yes" to skip manual review for that
//        realtor's future submissions. Leave blank to keep reviewing them
//        by hand — they can still get a Slug/Display Name (public agent
//        page) without Auto Publish being on; the two are independent.
//    Add one row per approved realtor.
// 2. Copy that new sheet's id out of its URL (the long string between /d/
//    and /edit) — you need it for step 4 below AND for src/lib/agents.ts
//    (AGENTS_SHEET_ID there).
// 3. On the LISTINGS sheet (the one this site reads): Extensions > Apps
//    Script, delete the default code, paste this file's contents in.
// 4. Set AGENTS_SHEET_ID below to the id from step 2. Save.
// 5. Run once manually: function dropdown next to Run > select
//    authorizeAccess > Run > approve the permission prompt. Safe to delete
//    that function afterward.
// 6. Triggers (clock icon, left sidebar) > Add Trigger > Function to run:
//    onFormSubmit > Event source: From spreadsheet > Event type: On form
//    submit > Save.
//
// If listings actually land in this sheet some way other than a linked
// Google Form, change the trigger's event type to "On change" instead —
// this same onFormSubmit function still works either way, since it re-reads
// whichever row the event points at rather than trusting the event payload.

const AGENTS_SHEET_ID = 'REPLACE_WITH_AGENTS_SHEET_ID';
const COL_CONTACT_EMAIL = 'Correo electrónico de contacto (el que verán los compradores)';
const COL_PUBLISHED_STATUS = 'Published Status';

function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    if (row === 1) return; // header row — shouldn't fire, but don't touch it if it does

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const emailCol = headers.indexOf(COL_CONTACT_EMAIL);
    const statusCol = headers.indexOf(COL_PUBLISHED_STATUS);
    if (emailCol === -1 || statusCol === -1) return;

    const email = (sheet.getRange(row, emailCol + 1).getDisplayValue() || '').trim().toLowerCase();
    if (!email || !isAutoPublishAgent(email)) return; // leave blank — normal manual review applies

    sheet.getRange(row, statusCol + 1).setValue('Yes');
  } finally {
    lock.releaseLock();
  }
}

function isAutoPublishAgent(email) {
  const sheet = SpreadsheetApp.openById(AGENTS_SHEET_ID).getSheets()[0];
  const data = sheet.getDataRange().getDisplayValues();
  const headers = data[0];
  const emailCol = headers.indexOf('Email');
  const autoPublishCol = headers.indexOf('Auto Publish');
  if (emailCol === -1 || autoPublishCol === -1) return false;

  for (let i = 1; i < data.length; i++) {
    if ((data[i][emailCol] || '').toLowerCase().trim() === email) {
      return (data[i][autoPublishCol] || '').trim().toLowerCase() === 'yes';
    }
  }
  return false;
}

// TEMPORARY — run this ONCE manually (see setup step 5), then approve the
// permission prompt it triggers. Safe to delete afterward.
function authorizeAccess() {
  SpreadsheetApp.openById(AGENTS_SHEET_ID).getSheets()[0].getRange(1, 1).getValue();
}
