# TTM Engines – engine data form

Files:
- `index.html` – the form (all questions, design and logic in one file)
- `slike/` – images (logo, measurement pictures); keep this folder next to `index.html`
- `sw.js` – lets the form open without signal after the first visit
- `apps-script/Code.gs` – receives submissions into Google Sheets (not uploaded to GitHub)

## 1. Google Sheet + Apps Script (about 5 min)

1. Create a new Google Sheet, e.g. "TTM – podaci o motoru".
2. **Extensions → Apps Script**. Delete everything in the editor, paste the content of `apps-script/Code.gs`, save (Ctrl+S).
3. Optional: put your email between the quotes in `NOTIFY_EMAIL` to get an email for each submission.
4. **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click Deploy, then authorize. On "Google hasn't verified this app" click **Advanced → Go to (project name) (unsafe)** → Allow. This is normal for your own scripts.
6. Copy the **Web app URL** (ends in `/exec`). Open it in the browser once: it should show `{"ok":true,...}`.

## 2. Connect the form

Open `index.html` in a text editor (Notepad++ or VS Code), find near the top of the script:

```js
endpoint: "",
```

and paste the URL between the quotes. Save.

## 3. GitHub Pages (about 5 min)

1. On github.com: **New repository**, name e.g. `obrazac`, Public, Create.
2. **Add file → Upload files**, drag in `index.html`, `sw.js` and the `slike` folder. Commit.
3. **Settings → Pages** → Source: *Deploy from a branch*, Branch: `main` / `(root)` → Save.
4. After a minute the form is live at `https://<your-username>.github.io/obrazac/`.

Send a test submission from your phone and check that a row appears in the "Odgovori" tab.

## Editing later

- Questions are in the `SECTIONS` list near the top of `index.html`. One line per question.
- **Explanations** go in `hint: ""`. When a hint is filled in, a "Kako izmjeriti" link appears under that question. HTML is allowed, e.g. `hint: "Izmjerite na tri visine. <img src='slike/provrt.jpg' alt=''>"`.
- One picture for several questions: add an entry with `hintOnly: true` (its own `key`, a `label` and a `hint`) right after those questions. It shows one shared "Kako izmjeriti" under them and is not sent to the sheet. See the valve diameters for an example. If it covers more than 2 questions, add `covers: N`. To show "Kako pročitati" instead of "Kako izmjeriti" (values read from a document, not measured), add `how: "how_read"`; see the valve timing group.
- Never change an existing `key` – it's what links the answer to its column in the sheet. Labels can be changed freely.
- If you change `Code.gs` later: **Deploy → Manage deployments → edit (pencil) → Version: New version**. The URL stays the same.
- After uploading a new `index.html` to GitHub, phones get the update the next time they open the form with internet.

## Languages

- The flags in the top right switch the form between Croatian, English, Italian and German. The choice is remembered on that device; on the first visit the browser's language decides, otherwise Croatian.
- Croatian text lives in `SECTIONS`. Translations live in `T` (one block per language: `ui` for buttons and messages, `sections`, `fields`, `grid`, `units`). Anything missing from a translation shows in Croatian.
- To add a language: add a line to `LANGS` (code, name, flag image in `slike/flags/`; also add it to the list in `sw.js`) and a block with the same code in `T`.
- The sheet always uses Croatian column names. A "Jezik" column shows which language the form was filled in.
