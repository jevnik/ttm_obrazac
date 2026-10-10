/**
 * TTM Engines – prijem podataka iz obrasca "Podaci o motoru"
 * Zalijepite u Google Sheet: Extensions -> Apps Script, zamijenite sav sadržaj ovim kodom.
 * Zatim: Deploy -> New deployment -> Web app
 *   Execute as: Me    Who has access: Anyone
 */

const SHEET_NAME = "Odgovori";
const NOTIFY_EMAIL = "";   // npr. "info@ttm-engines.hr" – prazno = bez obavijesti e-mailom

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);

    // Zamka za spam-botove: ljudi ne vide ovo polje
    if (data.website) return json({ ok: true });
    if (!data.id || !Array.isArray(data.fields) || typeof data.answers !== "object") {
      return json({ ok: false, error: "neispravni podaci" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Stupci se prepoznaju po ključu spremljenom u bilješci (note) zaglavlja,
    // pa promjena naziva pitanja ili dodavanje novih pitanja ne pomiče stare podatke.
    const lastCol = sh.getLastColumn();
    const keys = lastCol ? sh.getRange(1, 1, 1, lastCol).getNotes()[0] : [];

    // Zaštita od dvostrukog slanja (npr. ponovni pokušaj nakon gubitka veze)
    const idCol = keys.indexOf("_id") + 1;
    if (idCol > 0 && sh.getLastRow() > 1) {
      const ids = sh.getRange(2, idCol, sh.getLastRow() - 1, 1).getValues().flat();
      if (ids.indexOf(data.id) >= 0) return json({ ok: true, duplicate: true });
    }

    const columns = [{ key: "_time", label: "Vrijeme" }, { key: "_id", label: "ID" }].concat(data.fields);
    columns.forEach(function (f) {
      if (keys.indexOf(f.key) < 0) {
        keys.push(f.key);
        sh.getRange(1, keys.length).setValue(String(f.label)).setNote(f.key).setFontWeight("bold");
      }
    });

    const row = keys.map(function (k) {
      if (k === "_time") return new Date();
      if (k === "_id") return data.id;
      const v = data.answers[k];
      if (v === undefined || v === null) return "";
      if (typeof v === "number") return v;
      const s = String(v).slice(0, 5000);
      return /^[=+\-@]/.test(s) ? "'" + s : s;   // sprječava da se tekst izvrši kao formula
    });
    sh.appendRow(row);
    sh.setFrozenRows(1);

    if (NOTIFY_EMAIL) {
      const a = data.answers;
      MailApp.sendEmail(NOTIFY_EMAIL,
        "Novi podaci o motoru: " + (a.ime || "") + (a.oznaka_motora ? " – " + a.oznaka_motora : ""),
        "Stigli su novi podaci.\n\nIme: " + (a.ime || "") + "\nTelefon: " + (a.telefon || "") +
        "\nE-mail: " + (a.email || "") + "\nVozilo: " + (a.vozilo || "") +
        "\n\nTablica: " + ss.getUrl());
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Otvorite URL web aplikacije u pregledniku za provjeru – treba pisati {"ok":true,...}
function doGet() {
  return json({ ok: true, status: "Obrazac je povezan." });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
