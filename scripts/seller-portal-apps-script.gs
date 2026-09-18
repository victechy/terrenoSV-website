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
// To edit this later (this includes the admin-panel additions below): paste
// the new version into the SAME project from step 4 > Deploy > Manage
// deployments > pick the existing deployment > Edit (pencil) > Version: New
// version > Deploy. The URL stays the same either way — no new deployment,
// no re-authorization needed for the admin panel specifically.
//
// Admin panel (list/approve/deny realtor applications) additional setup:
// 8. On the "terrenoSV - Regístrate para Publicar (Responses)" sheet (the
//    private one with DUI numbers — leave its sharing exactly as private as
//    it already is), add a column with the header "Review Status" (exact
//    spelling). Leave it blank for every row — blank means still pending.
// 9. Copy that sheet's id out of its URL and set APPLICATION_SHEET_ID below.
// 10. Push a new version (see above). No new authorization/trigger needed —
//     this reuses the same deployment, login flow, and token sheet as the
//     seller portal, just gated to ADMIN_EMAIL below.

// Keep this in sync with the live deployment and with PORTAL_SHARED_SECRET
// in src/lib/portal.ts. Deliberately the real value, not a placeholder —
// pasting a placeholder here over the live deployment silently breaks every
// request from the site (already happened once).
const SHARED_SECRET = '!A@S#D$F5g6h7j8kV1ctor@nni@';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_ALIAS = 'app@terrenosv.org';
const SITE_ORIGIN = 'https://terrenosv.org';

// Same spreadsheet id the site's SHEET_CSV_URL points at (src/lib/listings.ts).
const LISTINGS_SHEET_ID = '128JAe0bscus3dxINM0M3ImLMGtbZGC8OAH3f0nSamE0';
const COL_TIMESTAMP = 'Timestamp';
const COL_CONTACT_EMAIL = 'Correo electrónico de contacto (el que verán los compradores)';
const COL_SELLER_STATUS = 'Seller Status';

// Admin surface (list/approve/deny realtor applications) — gated by checking
// the logged-in session's email against this, not a separate auth system.
// Same spreadsheet id as AGENTS_SHEET_ID in src/lib/agents.ts.
const ADMIN_EMAIL = 'vflores.sv@gmail.com';
const AGENTS_SHEET_ID = '19pUngke0awIXhpgYHl80uKF7AS97Xv4DcgqTCMPtrFU';
const COL_AGENT_EMAIL = 'Email';
const COL_AGENT_SLUG = 'Slug';
const COL_AGENT_DISPLAY_NAME = 'Display Name';
const COL_AGENT_AUTO_PUBLISH = 'Auto Publish';

// The "terrenoSV - Regístrate para Publicar (Responses)" sheet's id (the
// private one with DUI numbers) — real value kept in sync here, same
// reasoning as SHARED_SECRET above: never leave a placeholder that a future
// paste-over could reset the live deployment back to. That sheet also needs
// a "Review Status" column header added — left blank = pending, this script
// sets it to "Approved" or "Denied".
const APPLICATION_SHEET_ID = '1YP-sGGHbFsHCTuRRD82D7IJCu-smO8asgGv80Q4ppYE';
const COL_APP_TIMESTAMP = 'Timestamp';
const COL_APP_EMAIL = 'Email address';
const COL_APP_FIRST_NAME = 'Nombre(s)';
const COL_APP_LAST_NAME = 'Apellido(s)';
const COL_APP_REVIEW_STATUS = 'Review Status';
// Soft-matched (missing/renamed columns degrade to blank, not an error) —
// double check these against your sheet's actual headers if fields show up
// empty in the admin panel.
const COL_APP_BUSINESS = 'Nombre de tu empresa/agencia de bienes raíces';
const COL_APP_PHONE = 'Número de teléfono/WhatsApp';
const COL_APP_EXPERIENCE = '¿Cuántos años de experiencia tienes vendiendo o rentando propiedades?';
const COL_APP_REASON = '¿Por qué quieres publicar en terrenoSV?';
const COL_APP_SOCIAL = 'Enlace a tu Facebook, Instagram, o sitio web de negocio (si tienes)';
// Deliberately NOT read anywhere in this file: the DUI column. Never include
// it in any response sent to the browser.

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
    if (body.action === 'list-applications') return handleListApplications(body);
    if (body.action === 'approve-agent') return handleApproveAgent(body);
    if (body.action === 'deny-agent') return handleDenyAgent(body);

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
  // don't let the response leak which emails are sellers. The admin email
  // always gets a link too, regardless of whether it happens to have any
  // listings of its own.
  if (email === ADMIN_EMAIL.toLowerCase() || emailHasListings(email)) {
    const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
    // Stored as a plain epoch-ms number, not a Date — reading it back via
    // getDisplayValues() and re-parsing a formatted date string would be
    // locale-dependent (e.g. DD/MM/YYYY sheets silently mis-parse as
    // MM/DD/YYYY). A number round-trips exactly, no ambiguity.
    const expiresAtMs = Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
    getTokenSheet().appendRow([token, email, expiresAtMs]);

    try {
      // The admin email always lands on /admin, not /portal — same token
      // works on either page, but there's no reason to make the admin land
      // somewhere they then have to navigate away from. Admin also gets the
      // email in English; sellers get Spanish, same as the rest of /portal.
      const isAdmin = email === ADMIN_EMAIL.toLowerCase();
      const destination = isAdmin ? '/admin' : '/portal';
      const link = SITE_ORIGIN + destination + '?token=' + encodeURIComponent(token);
      const subject = isAdmin ? 'Your terrenoSV access' : 'Tu acceso a terrenoSV';
      const body = isAdmin
        ? 'Log in with this link (valid for ' + TOKEN_TTL_DAYS + ' days):\n\n' + link +
          "\n\nIf you didn't request this, you can ignore this email.\n\n- terrenoSV"
        : 'Entra a tus publicaciones con este enlace (valido por ' + TOKEN_TTL_DAYS + ' dias):\n\n' + link +
          '\n\nSi no solicitaste esto, puedes ignorar este correo.\n\n- terrenoSV';
      GmailApp.sendEmail(email, subject, body, { from: FROM_ALIAS, name: 'terrenoSV' });
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
  const headers = headerRow(data);
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
  const headers = headerRow(data);
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

// Returns the admin's verified email, or writes an Unauthorized response and
// returns null. Every admin action must call this before touching anything.
function requireAdmin(token) {
  const found = findToken(token);
  if (!found || found.email !== ADMIN_EMAIL.toLowerCase()) return null;
  return found.email;
}

function handleListApplications(body) {
  const token = (body.token || '').toString();
  if (!requireAdmin(token)) return jsonResponse({ success: false, error: 'Unauthorized' });

  const sheet = SpreadsheetApp.openById(APPLICATION_SHEET_ID).getSheets()[0];
  const data = sheet.getDataRange().getDisplayValues();
  const headers = headerRow(data);

  const timestampCol = headers.indexOf(COL_APP_TIMESTAMP);
  const emailCol = headers.indexOf(COL_APP_EMAIL);
  const firstNameCol = headers.indexOf(COL_APP_FIRST_NAME);
  const lastNameCol = headers.indexOf(COL_APP_LAST_NAME);
  const reviewStatusCol = headers.indexOf(COL_APP_REVIEW_STATUS);
  if (timestampCol === -1 || emailCol === -1 || reviewStatusCol === -1) {
    return jsonResponse({
      success: false,
      error: 'Application sheet is missing a required column (Timestamp / Email address / Review Status) — see setup comment at the top of this file.',
    });
  }
  // Soft-matched — a missing/renamed column just means that field comes back
  // blank in the admin panel, not a hard failure.
  const businessCol = headers.indexOf(COL_APP_BUSINESS);
  const phoneCol = headers.indexOf(COL_APP_PHONE);
  const experienceCol = headers.indexOf(COL_APP_EXPERIENCE);
  const reasonCol = headers.indexOf(COL_APP_REASON);
  const socialCol = headers.indexOf(COL_APP_SOCIAL);
  const cell = function (row, col) {
    return col === -1 ? '' : row[col] || '';
  };

  const applications = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if ((row[reviewStatusCol] || '').trim() !== '') continue; // already approved/denied

    applications.push({
      id: row[timestampCol],
      email: cell(row, emailCol),
      firstName: cell(row, firstNameCol),
      lastName: cell(row, lastNameCol),
      businessName: cell(row, businessCol),
      phone: cell(row, phoneCol),
      experience: cell(row, experienceCol),
      reason: cell(row, reasonCol),
      social: cell(row, socialCol),
    });
  }

  return jsonResponse({ success: true, applications: applications });
}

function handleApproveAgent(body) {
  const token = (body.token || '').toString();
  const applicationId = (body.applicationId || '').toString();
  if (!requireAdmin(token)) return jsonResponse({ success: false, error: 'Unauthorized' });

  const appSheet = SpreadsheetApp.openById(APPLICATION_SHEET_ID).getSheets()[0];
  const data = appSheet.getDataRange().getDisplayValues();
  const headers = headerRow(data);
  const timestampCol = headers.indexOf(COL_APP_TIMESTAMP);
  const emailCol = headers.indexOf(COL_APP_EMAIL);
  const firstNameCol = headers.indexOf(COL_APP_FIRST_NAME);
  const lastNameCol = headers.indexOf(COL_APP_LAST_NAME);
  const phoneCol = headers.indexOf(COL_APP_PHONE);
  const reviewStatusCol = headers.indexOf(COL_APP_REVIEW_STATUS);

  for (let i = 1; i < data.length; i++) {
    if (data[i][timestampCol] !== applicationId) continue;

    const email = (data[i][emailCol] || '').trim().toLowerCase();
    const firstName = (data[i][firstNameCol] || '').trim();
    const lastName = (data[i][lastNameCol] || '').trim();
    const phone = phoneCol === -1 ? '' : (data[i][phoneCol] || '').trim();
    if (!email) return jsonResponse({ success: false, error: 'Application has no email' });

    appSheet.getRange(i + 1, reviewStatusCol + 1).setValue('Approved');
    upsertAgent(email, (firstName + ' ' + lastName).trim());

    try {
      sendApprovalEmail(email, firstName, (firstName + ' ' + lastName).trim(), phone);
    } catch (mailErr) {
      // swallow — approval itself already succeeded and shouldn't be undone
      // by a failed congratulations email.
    }

    return jsonResponse({ success: true });
  }

  return jsonResponse({ success: false, error: 'Application not found' });
}

// The "Publica tu Propiedad" form — entry ids read directly off the live
// form's own FB_PUBLIC_LOAD_DATA_ (Forms doesn't expose these any other
// way). Re-extract them the same way if this form is ever edited and IDs
// need re-checking: open the form, DevTools console,
// FB_PUBLIC_LOAD_DATA_[1][1] lists every question with its entry id(s).
const PROPERTY_FORM_BASE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfYtJ6ugawIdq7arZTZzLvefp6ssj7oZA6P3gA-KGUAl6FGLg/viewform';
const FORM_ENTRY_NAME = 'entry.1438705812'; // "Tu nombre completo"
const FORM_ENTRY_EMAIL = 'entry.155736615'; // "Correo electrónico de contacto..."
const FORM_ENTRY_PHONE = 'entry.850593457'; // "Número de teléfono/WhatsApp"
const FORM_ENTRY_CONTACT_PREF = 'entry.1974201093'; // "¿Cómo prefieres que te contacten?"
const FORM_CONTACT_PREF_WHATSAPP = '📞WhatsApp'; // "📞WhatsApp" — must match the option text exactly
// Deliberately NOT prefilled: the "Confirmo que tengo autorización..."
// checkbox (entry.800152054) — left unchecked on purpose, they need to
// actively confirm it themselves for each property they list.

function buildPrefilledFormUrl(name, email, phone) {
  const params = [
    FORM_ENTRY_NAME + '=' + encodeURIComponent(name),
    FORM_ENTRY_EMAIL + '=' + encodeURIComponent(email),
    FORM_ENTRY_CONTACT_PREF + '=' + encodeURIComponent(FORM_CONTACT_PREF_WHATSAPP),
  ];
  if (phone) params.push(FORM_ENTRY_PHONE + '=' + encodeURIComponent(phone));
  return PROPERTY_FORM_BASE_URL + '?usp=pp_url&' + params.join('&');
}

function sendApprovalEmail(email, firstName, fullName, phone) {
  const formUrl = buildPrefilledFormUrl(fullName, email, phone);
  const greetingName = firstName || fullName || 'agente';

  const subject = '¡Bienvenido a terrenoSV!';
  const body =
    'Hola ' + greetingName + ',\n\n' +
    'Gracias por tu confianza y por sumarte a terrenoSV. Es un placer contar contigo en este proyecto tan emocionante, ' +
    'y sabemos que juntos será todo un éxito.\n\n' +
    'Ya puedes empezar a publicar tus propiedades con este enlace (ya viene con tu información de contacto pre-llenada):\n\n' +
    formUrl + '\n\n' +
    'Te deseo el mayor de los éxitos en esta y en todas tus futuras aventuras.\n\n' +
    'Un saludo cordial,\n' +
    'Victor Flores\n' +
    'Fundador, terrenoSV';

  GmailApp.sendEmail(email, subject, body, { from: FROM_ALIAS, name: 'Victor Flores - terrenoSV' });
}

function handleDenyAgent(body) {
  const token = (body.token || '').toString();
  const applicationId = (body.applicationId || '').toString();
  if (!requireAdmin(token)) return jsonResponse({ success: false, error: 'Unauthorized' });

  const appSheet = SpreadsheetApp.openById(APPLICATION_SHEET_ID).getSheets()[0];
  const data = appSheet.getDataRange().getDisplayValues();
  const headers = headerRow(data);
  const timestampCol = headers.indexOf(COL_APP_TIMESTAMP);
  const reviewStatusCol = headers.indexOf(COL_APP_REVIEW_STATUS);

  for (let i = 1; i < data.length; i++) {
    if (data[i][timestampCol] !== applicationId) continue;
    appSheet.getRange(i + 1, reviewStatusCol + 1).setValue('Denied');
    return jsonResponse({ success: true });
  }

  return jsonResponse({ success: false, error: 'Application not found' });
}

// Adds (or updates, if the email is already there) a row on the Agents
// sheet with Auto Publish = Yes. This is the only place that writes to that
// sheet, so slug uniqueness is enforced right here.
function upsertAgent(email, displayName) {
  const sheet = SpreadsheetApp.openById(AGENTS_SHEET_ID).getSheets()[0];
  const data = sheet.getDataRange().getDisplayValues();
  const headers = headerRow(data);
  const emailCol = headers.indexOf(COL_AGENT_EMAIL);
  const slugCol = headers.indexOf(COL_AGENT_SLUG);
  const nameCol = headers.indexOf(COL_AGENT_DISPLAY_NAME);
  const autoPublishCol = headers.indexOf(COL_AGENT_AUTO_PUBLISH);

  const existingSlugs = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][slugCol]) existingSlugs[data[i][slugCol]] = true;
    if ((data[i][emailCol] || '').toLowerCase().trim() === email) {
      sheet.getRange(i + 1, nameCol + 1).setValue(displayName);
      sheet.getRange(i + 1, autoPublishCol + 1).setValue('Yes');
      if (!data[i][slugCol]) {
        sheet.getRange(i + 1, slugCol + 1).setValue(uniqueSlug(displayName, existingSlugs));
      }
      return;
    }
  }

  const slug = uniqueSlug(displayName, existingSlugs);
  const newRow = [];
  newRow[emailCol] = email;
  newRow[slugCol] = slug;
  newRow[nameCol] = displayName;
  newRow[autoPublishCol] = 'Yes';
  sheet.appendRow(newRow);
}

function uniqueSlug(text, existingSlugs) {
  const base = slugify(text) || 'agente';
  let candidate = base;
  let n = 2;
  while (existingSlugs[candidate]) {
    candidate = base + '-' + n;
    n++;
  }
  existingSlugs[candidate] = true;
  return candidate;
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function emailHasListings(email) {
  const sheet = SpreadsheetApp.openById(LISTINGS_SHEET_ID).getSheets()[0];
  const data = sheet.getDataRange().getDisplayValues();
  const headers = headerRow(data);
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

// Trims every header cell before any indexOf lookup against it — a header
// with a stray trailing/leading space (easy to introduce by accident in a
// form question or a sheet header) would otherwise silently fail to match
// and that column would just come back blank everywhere, with no error.
function headerRow(data) {
  return data[0].map(function (h) {
    return (h || '').toString().trim();
  });
}
