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

// Sent once, right at signup — not just a receipt, this is what gets the
// sender address (your Gmail) a first real interaction with each recipient
// before the actual launch email goes out to the whole list at once. That
// ask to whitelist only makes sense inside an email that already exists in
// their inbox, which is exactly why it isn't on the website's success message.
const CONFIRMATION_COPY = {
  en: {
    subject: "You're on the terrenoSV launch list",
    body: "Thanks for signing up! We'll email you the moment the terrenoSV app is live.\n\n" +
      "One request: please add florespublishing@gmail.com to your contacts (or move this email out of Spam/Promotions if that's where it landed). That way our launch announcement actually reaches your inbox.\n\n" +
      "— terrenoSV",
  },
  es: {
    subject: "Ya estás en la lista de lanzamiento de terrenoSV",
    body: "¡Gracias por registrarte! Te avisaremos por correo en cuanto la app terrenoSV esté disponible.\n\n" +
      "Un favor: agrega florespublishing@gmail.com a tus contactos (o mueve este correo fuera de Spam/Promociones si llegó ahí). Así nuestro anuncio de lanzamiento sí llegará a tu bandeja de entrada.\n\n" +
      "— terrenoSV",
  },
};

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

    // Best-effort: a failed send shouldn't undo the signup that already
    // succeeded above, so this is deliberately isolated from the outer catch.
    try {
      const locale = body.locale === 'es' ? 'es' : 'en';
      const copy = CONFIRMATION_COPY[locale];
      MailApp.sendEmail(email, copy.subject, copy.body);
    } catch (mailErr) {
      // swallow — subscription itself still succeeded
    }

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
