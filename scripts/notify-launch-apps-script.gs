// terrenoSV — App launch notify-me signup, stored in its own Google Sheet.
//
// Setup:
// 1. Create a NEW blank Google Sheet (do not reuse the listings sheet —
//    that one is publicly readable via CSV export for the app/site to work,
//    and emails collected here must never be exposed that way).
// 2. Add a header row: "Timestamp" in A1, "Email" in B1.
// 3. Extensions > Apps Script, delete the default code, paste this file's
//    contents in, save.
// 4. Deploy > New deployment > type "Web app" > Execute as: Me > Who has
//    access: Anyone. Deploy, authorize the requested permissions (it needs
//    to edit this spreadsheet), and copy the resulting /exec URL.
// 5. Send that URL back — it goes into src/lib/notify.ts as NOTIFY_ENDPOINT.
//
// To edit this later: Extensions > Apps Script > paste the new version >
// Deploy > Manage deployments > pick the existing deployment > Edit (pencil)
// > Version: New version > Deploy. The URL stays the same either way.

const SHARED_SECRET = 'W5bbbYm9EVPNZUHgY6zQEaHCvpHWDSR';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== SHARED_SECRET) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    // Honeypot: a real visitor never fills this hidden field, a bot often
    // does. Pretend success so the bot doesn't learn anything, but don't
    // actually record it.
    if (body.hp) {
      return jsonResponse({ success: true });
    }

    const email = (body.email || '').toString().trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ success: false, error: 'Invalid email' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const data = sheet.getDataRange().getDisplayValues();
    const headers = data[0];
    const emailCol = headers.indexOf('Email');

    for (let i = 1; i < data.length; i++) {
      if ((data[i][emailCol] || '').toLowerCase() === email) {
        // Already on the list — not an error, just nothing new to add.
        return jsonResponse({ success: true, alreadySubscribed: true });
      }
    }

    sheet.appendRow([new Date(), email]);
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return jsonResponse({ status: 'terrenoSV notify-launch endpoint is running' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
