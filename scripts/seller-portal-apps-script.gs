// terrenoSV — Seller portal: passwordless login (magic link) + listing
// status changes (Pending Sale / Sold / Removed), for realtors managing
// their own listings without needing sheet access.
//
// Setup:
// 1. Create a NEW blank Google Sheet (do not reuse the listings sheet —
//    that one is publicly readable via CSV export for the app/site to work,
//    and login tokens must never be exposed that way).
// 2. Add a header row: "Token" in A1, "Email" in B1, "ExpiresAt" in C1.
//    Column C will fill with plain numbers (epoch milliseconds), not
//    readable dates — that's intentional, ignore how odd it looks.
// 3. On the LISTINGS sheet (the one SHEET_ID below points at), add a new
//    column with the header "Seller Status" (exact spelling) if it doesn't
//    exist yet. Leave it blank for every existing row — blank means active/
//    published, same as if you'd typed "Active".
// 4. On the new blank sheet from step 1: Extensions > Apps Script, delete
//    the default code, paste this file's contents in, save.
// 5. Run once manually: function dropdown next to Run > select
//    authorizeGmailAccess > Run > approve the permission prompt (grants
//    Gmail-send + cross-spreadsheet edit access). Safe to delete after.
// 6. Deploy > New deployment > type "Web app" > Execute as: Me > Who has
//    access: Anyone. Deploy, copy the resulting /exec URL.
// 7. Send that URL + SHARED_SECRET back — they go into src/lib/portal.ts as
//    PORTAL_ENDPOINT / PORTAL_SHARED_SECRET.
//
// To edit this later: Extensions > Apps Script > paste the new version >
// Deploy > Manage deployments > pick the existing deployment > Edit (pencil)
// > Version: New version > Deploy. The URL stays the same either way.

const SHARED_SECRET = 'REPLACE_ME_WITH_A_LONG_RANDOM_STRING';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_ALIAS = 'app@terrenosv.org';
const SITE_ORIGIN = 'https://terrenosv.org';

// Same spreadsheet id the site's SHEET_CSV_URL points at (src/lib/listings.ts).
const LISTINGS_SHEET_ID = '128JAe0bscus3dxINM0M3ImLMGtbZGC8OAH3f0nSamE0';
const COL_TIMESTAMP = 'Timestamp';
const COL_CONTACT_EMAIL = 'Correo electrónico de contacto (el que verán los compradores)';
const COL_SELLER_STATUS = 'Seller Status';

const TOKEN_TTL_DAYS = 30;
const ALLOWED_STATUSES = ['Pending Sale', 'Sold', 'Removed'];

// Self-edit is deliberately narrow: price/title/description are low-risk,
// correctable-by-the-seller fields. Photos, location, and property type stay
// out of self-edit — those are exactly the changes worth a second look.
const EDITABLE_COLUMNS = {
  price: 'Precio (USD)',
  title: 'Título de la propiedad',
  description: 'Descripción',
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SHARED_SECRET) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (body.action === 'request-link') return handleRequestLink(body);
    if (body.action === 'verify-token') return handleVerifyToken(body);
    if (body.action === 'update-status') return handleUpdateStatus(body);
    if (body.action === 'update-fields') return handleUpdateFields(body);

    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

function handleRequestLink(body) {
  const email = (body.email || '').toString().trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return jsonResponse({ success: false, error: 'Invalid email' });
  }

  // Deliberately the same response whether or not this email has listings —
  // don't let the response leak which emails are sellers.
  if (emailHasListings(email)) {
    const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
    // Stored as a plain epoch-ms number, not a Date — reading it back via
    // getDisplayValues() and re-parsing a formatted date string would be
    // locale-dependent (e.g. DD/MM/YYYY sheets silently mis-parse as
    // MM/DD/YYYY). A number round-trips exactly, no ambiguity.
    const expiresAtMs = Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
    getTokenSheet().appendRow([token, email, expiresAtMs]);

    try {
      const link = SITE_ORIGIN + '/portal?token=' + encodeURIComponent(token);
      GmailApp.sendEmail(
        email,
        'Tu acceso a terrenoSV',
        'Entra a tus publicaciones con este enlace (valido por ' + TOKEN_TTL_DAYS + ' dias):\n\n' + link +
          '\n\nSi no solicitaste esto, puedes ignorar este correo.\n\n- terrenoSV',
        { from: FROM_ALIAS, name: 'terrenoSV' }
      );
    } catch (mailErr) {
      // swallow — token still works if they already had a prior email, and
      // we don't want to reveal send failures to the caller either.
    }
  }

  return jsonResponse({ success: true });
}

function handleVerifyToken(body) {
  const token = (body.token || '').toString();
  const found = findToken(token);
  if (!found) return jsonResponse({ success: false });

  // Sliding expiry: an active realtor never gets logged out mid-use.
  const newExpiresAtMs = Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  getTokenSheet().getRange(found.row, 3).setValue(newExpiresAtMs);

  return jsonResponse({ success: true, email: found.email });
}

function handleUpdateStatus(body) {
  const token = (body.token || '').toString();
  const listingId = (body.listingId || '').toString();
  const status = (body.status || '').toString();

  if (ALLOWED_STATUSES.indexOf(status) === -1) {
    return jsonResponse({ success: false, error: 'Invalid status' });
  }

  const found = findToken(token);
  if (!found) return jsonResponse({ success: false, error: 'Session expired' });

  const listingsSheet = SpreadsheetApp.openById(LISTINGS_SHEET_ID).getSheets()[0];
  const data = listingsSheet.getDataRange().getDisplayValues();
  const headers = data[0];
  const timestampCol = headers.indexOf(COL_TIMESTAMP);
  const emailCol = headers.indexOf(COL_CONTACT_EMAIL);
  const statusCol = headers.indexOf(COL_SELLER_STATUS);

  if (statusCol === -1) {
    return jsonResponse({ success: false, error: 'Listings sheet is missing the "Seller Status" column — see setup step 3.' });
  }

  for (let i = 1; i < data.length; i++) {
    const rowEmail = (data[i][emailCol] || '').toLowerCase().trim();
    if (data[i][timestampCol] === listingId && rowEmail === found.email) {
      listingsSheet.getRange(i + 1, statusCol + 1).setValue(status);
      return jsonResponse({ success: true });
    }
  }

  // Either the id doesn't exist, or it exists but isn't owned by this
  // session's email — same error either way, don't leak which.
  return jsonResponse({ success: false, error: 'Listing not found' });
}

function handleUpdateFields(body) {
  const token = (body.token || '').toString();
  const listingId = (body.listingId || '').toString();
  const fields = body.fields && typeof body.fields === 'object' ? body.fields : {};

  const found = findToken(token);
  if (!found) return jsonResponse({ success: false, error: 'Session expired' });

  // Whitelist which columns get written, and validate each one — never trust
  // the request to only send known-good keys/values.
  const updates = {};
  if (Object.prototype.hasOwnProperty.call(fields, 'price')) {
    const price = Number(fields.price);
    if (!isFinite(price) || price <= 0) return jsonResponse({ success: false, error: 'Invalid price' });
    updates[EDITABLE_COLUMNS.price] = price;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'title')) {
    const title = (fields.title || '').toString().trim();
    if (!title || title.length > 200) return jsonResponse({ success: false, error: 'Invalid title' });
    updates[EDITABLE_COLUMNS.title] = title;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'description')) {
    const description = (fields.description || '').toString().trim();
    if (description.length > 5000) return jsonResponse({ success: false, error: 'Description too long' });
    updates[EDITABLE_COLUMNS.description] = description;
  }

  if (Object.keys(updates).length === 0) {
    return jsonResponse({ success: false, error: 'No fields to update' });
  }

  const listingsSheet = SpreadsheetApp.openById(LISTINGS_SHEET_ID).getSheets()[0];
  const data = listingsSheet.getDataRange().getDisplayValues();
  const headers = data[0];
  const timestampCol = headers.indexOf(COL_TIMESTAMP);
  const emailCol = headers.indexOf(COL_CONTACT_EMAIL);

  for (let i = 1; i < data.length; i++) {
    const rowEmail = (data[i][emailCol] || '').toLowerCase().trim();
    if (data[i][timestampCol] === listingId && rowEmail === found.email) {
      const row = i + 1;
      Object.keys(updates).forEach(function (colName) {
        const colIndex = headers.indexOf(colName);
        if (colIndex !== -1) listingsSheet.getRange(row, colIndex + 1).setValue(updates[colName]);
      });
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ success: false, error: 'Listing not found' });
}

function emailHasListings(email) {
  const sheet = SpreadsheetApp.openById(LISTINGS_SHEET_ID).getSheets()[0];
  const data = sheet.getDataRange().getDisplayValues();
  const headers = data[0];
  const emailCol = headers.indexOf(COL_CONTACT_EMAIL);
  for (let i = 1; i < data.length; i++) {
    if ((data[i][emailCol] || '').toLowerCase().trim() === email) return true;
  }
  return false;
}

function findToken(token) {
  if (!token) return null;
  const sheet = getTokenSheet();
  // getValues() (not getDisplayValues()) — reads the raw stored number back
  // as a number, not a locale-formatted string that would need re-parsing.
  const data = sheet.getDataRange().getValues();
  const now = Date.now();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      const expiresAtMs = Number(data[i][2]);
      if (!expiresAtMs || expiresAtMs < now) return null;
      return { row: i + 1, email: (data[i][1] || '').toString().toLowerCase().trim() };
    }
  }
  return null;
}

function getTokenSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

// TEMPORARY — run this ONCE manually from the Apps Script editor (see setup
// step 5), then approve the permission prompt it triggers. Safe to delete
// afterward.
function authorizeGmailAccess() {
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), 'terrenoSV script authorized', 'This confirms Apps Script can send mail and edit the listings spreadsheet.');
  SpreadsheetApp.openById(LISTINGS_SHEET_ID).getSheets()[0].getRange(1, 1).getValue();
}

function doGet(e) {
  return jsonResponse({ status: 'terrenoSV seller-portal endpoint is running' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
