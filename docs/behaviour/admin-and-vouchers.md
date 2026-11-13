# Admin panel and gift voucher PDF (developer, phase 2)

> **Prototype built (2026-11-13):** the whole admin UI, desktop and mobile, is in `src/admin/` and runs at `/admin` on the dev server (`npm run dev`; prototype password: `demo`). It starts from the real content in `docs/content/` plus sample vouchers, and saves changes only in the browser (localStorage). It is **not** in the public build (set `ADMIN_PREVIEW=1` to include it in a preview build).
>
> For the developer:
> - **Data:** every screen goes through `src/admin/api.ts` → `AdminApi`. Replace `mockApi` with the real back end (auth, database, photo and PDF storage). The data shapes are in `src/admin/types.ts`.
> - **Website form:** `src/scripts/voucher.ts` → `submitVoucherRequest()` should create a `Voucher` with status `nowy`.
> - **PDF:** `src/admin/pdf/voucher-pdf.ts` (pdf-lib) already builds the final 2-page PDF in the browser from `pdf/voucher-layout.ts` (positions measured from Figma 520:83 / 520:82). It also runs in Node if you swap the `fetch` asset loading for file reads, so it can move to the server. Fonts: full static TTFs with Polish characters in `pdf/fonts/` (OFL licences included).
> - **Team photos:** uploads go through a crop pop-up (`src/admin/PhotoCropper.tsx`, square 800 × 800 WebP) with optional in-browser background removal (`src/admin/bg-removal.ts`). Self-host the model and ONNX runtime files before launch (see the comment in that file).
> - **Not in the prototype:** the website doesn't read admin data yet; the `/bon/…` PDF link isn't hosted; password reset doesn't send e-mail; nothing is sent by SMS.

Designed in Figma, page **"Landing back end" (353:4297)**: desktop 1440×900 screens in section 397:87, mobile 390×844 screens in section 429:1594, components in 393:11. There are prototype flows "Panel administracyjny" (desktop, starting at 410:1353) and "Panel administracyjny (mobile)" (starting at 429:1595). The admin UI is in Polish. The user is the owner, Anastazja.

## Scope
Booking stays in Booksy / Fresha / WhatsApp / Instagram, so there is **no calendar and no client database**. The admin panel covers:
1. **Login** (e-mail + password, "Zapamiętaj mnie", password reset by e-mail link valid for 1 h). The login e-mail is a placeholder.
2. **Bony podarunkowe:** the inbox of voucher requests from the website form, plus manual vouchers (ordered by phone or in person).
3. **Cennik:** edit treatments (name, category, optional description, duration/price rows, visible toggle) per language. Add and delete treatments.
   - **Exactly 6 categories:** the owner can rename a category and edit its card tagline, but can't add, delete or hide categories (the website grid is designed for 6).
   - "od X zł" is calculated automatically.
4. **Zespół:** reorder people; each person has a photo, visible toggle, name, role, bio (PL/EN/UA), their own Booksy/Fresha links and a prefilled WhatsApp message. Add new people.
5. **FAQ:** reorder, add, edit, delete and show/hide questions, per language.
6. **Info & teksty** (mobile tab: "Info"; replaced "Gabinet i rezerwacje" on 2026-11-13, the old `#/gabinet` address still opens it). It works like Zespół: a list of the parts of the website on the left, in page order, and an editor for the selected one on the right (`#/info/<id>`, e.g. `#/info/o-nas`). On mobile the list and the editor are separate screens with a back link. Each editor has its own "Zapisz zmiany" and "Cofnij zmiany":
   1. **Pasek na górze strony:** announcement (PL/EN/UA) with a preview and a "show until" date; otherwise the top bar shows the address.
   2. **Start (hero)**, 3. **O nas**, 4. **Bon podarunkowy**, 5. **Kontakt:** the section texts, per language: small heading, two-line title (line 2 is the italic one), and the description. O nas also has its text (one field; a blank line starts a new paragraph on the site, like a Zespół bio) and 3 feature boxes. Data: `SiteTexts` in `types.ts`, seeded from `site*.json`.
      - The structure is fixed: no adding or removing boxes or fields.
      - Each field has a soft character limit with a counter. Going over shows a warning but still saves. The limits are estimates from the current copy (`SECTIONS` in `Info.tsx`); check them against Figma.
      - An empty EN/UA field falls back to Polish. The list shows "brak EN/UA" when a translation is missing.
      - Button labels, form labels, menu and footer stay in `src/data/ui.*.json` and aren't editable.
   6. **Dane kontaktowe:** address, postcode, phone/WhatsApp, Instagram, Google Maps link.
   7. **Godziny otwarcia** per day.
   8. **Okienko rezerwacji** (the „Zarezerwuj wizytę” pop-up): the 4 booking channels: name, link, subtitle, group and visible toggle (the toggle saves straight away). The channels can't be deleted, only hidden.

Every change shows on the site right away ("Zmiany widać na stronie od razu"). That means the site has to read content from the admin data source: SSR, on-demand revalidation, or a rebuild hook. The developer chooses.

## Voucher statuses
Nowy → W kontakcie → Opłacony → **Przekazany** → Zrealizowany (+ Wygasły).
- Stat cards: Nowe zgłoszenia, Opłacone ("czekają na przekazanie"), Aktywne bony.
- New requests are tinted plum-100 in the list.

## Voucher detail actions
- Header actions: **Zadzwoń** (`tel:`), **WhatsApp**, **Oznacz jako przekazany**. After the voucher is handed over: **Oznacz jako zrealizowany**.
- **"Pobierz PDF":** downloads the voucher PDF. No dialog; a toast shows for about 4 s: "PDF pobrany. Gdy przekażesz bon, oznacz go jako przekazany." with the link "Oznacz teraz".
- **"Wyślij link przez WhatsApp":**
  1. Generates the PDF and stores it at a hard-to-guess URL (e.g. `massageheavenwarsaw.com/bon/7q4k-x8f2m`). The link must keep working until the voucher expires.
  2. Opens `wa.me/<buyer's number>?text=…` in a new tab.
  3. Shows the "Wysłałaś bon?" dialog with the buttons "Jeszcze nie" and "Tak, oznacz jako przekazany". The site can't know whether she pressed Send.
- **WhatsApp message template:** "Dzień dobry! Przesyłam bon podarunkowy Massage Heaven: <masaż>, <czas>. Kod <kod>, ważny do <data>. / Bon w PDF: <link> / Do zobaczenia na Kruczej 16/22!" Amount vouchers: "Dzień dobry! Przesyłam bon podarunkowy Massage Heaven o wartości <kwota>, do wykorzystania na dowolny zabieg z naszego cennika. Kod <kod>, ważny do <data>. / Bon w PDF: <link> / Przy rezerwacji wystarczy podać kod. Do zobaczenia na Kruczej 16/22!"
- **Manual voucher ("Dodaj bon ręcznie")** fields:
  - Rodzaj bonu (Konkretny masaż / Kwota). Kwota: at least the lowest price in the price list (now 80 zł), no maximum. The back end should check this too.
  - Masaż + Czas trwania + Wartość bonu (taken from the price list)
  - Kupujący + Telefon
  - Dla kogo (optional)
  - Status + Płatność (Gotówka, …)
  - Ważny ("12 miesięcy · do …"): always 12 months, not editable (client rule, 2026-11-13)
  - The code is generated automatically (format `MH-XXXX`).
- **Edit order ("Edytuj" on the Zamówienie card):** only while the voucher is **Nowy** or **W kontakcie**, so the client can change the massage, duration or amount before paying. Opens the same drawer as "Dodaj bon" (title "Edytuj bon") with Rodzaj bonu, Masaż/Czas/Wartość or Kwota, Kupujący, Telefon and Dla kogo. Status, payment and validity are not in it (they're set by "Oznacz jako opłacony"). Once paid, the code and PDF are fixed and the button disappears. Not designed in Figma yet.
- **Delete request ("Usuń zgłoszenie" at the bottom of the Zamówienie card):** same rule, only while **Nowy** or **W kontakcie**, for when the client changed their mind. Asks first ("Usunąć zgłoszenie?", "Tak, usuń"), then removes the voucher completely and goes back to the list. Paid vouchers can't be deleted: they stay in the list until they're realised or expire. API: `AdminApi.deleteVoucher(id)`; the back end should refuse it for paid vouchers too. Not designed in Figma yet.

## Gift voucher PDF
Figma page "Printables" (132:6):
- Front: component **520:83**
- Back: component **520:82**
- Filled examples: section 520:86
- Rules card: 520:235

- **One PDF** for print and WhatsApp: 2 pages (front, back), each **216×105 mm** (210×99 mm trim + 3 mm bleed), **RGB** (no CMYK conversion, decided 2026-11-13), fonts embedded (Instrument Serif/Sans, OFL), no crop marks.
- **The front is static.** The back has 5 value slots:
  - **Dla / For** = "Dla kogo". Optional; leave it blank for handwriting.
  - **Od / From** = the buyer's name.
  - **Usługa lub kwota:** "<service name> · <duration>" (e.g. "Masaż aromatyczny · 30 min · plecy"), or "<amount> zł". Polish names from the price list.
  - **Ważny do:** DD.MM.YYYY.
  - **Nr:** the voucher code (MH-XXXX).
- **Value style:** Instrument Serif Italic, 30 px, line height 36, plum #832F66, left-aligned on the line.
- **One line only.** If a value doesn't fit, shrink 1 px at a time down to **22 px**. Never wrap. Truncating with "…" is a last resort only.
- **Slot widths:** Dla, Od, Usługa = 657 px (111 mm). Ważny do, Nr = 308 px (52 mm). The longest service string fits at 28 px; 40 W's fit at 22 px.
- **Blank print template:** the back with all values empty.
- **Terms on the back:**
  - PL: "Bon można zrealizować w Massage Heaven, ul. Krucza 16/22, Warszawa. Umów wizytę przez Booksy, Fresha, WhatsApp lub Instagram i podaj numer bonu. Bon nie podlega wymianie na gotówkę."
  - EN: "Redeemable at Massage Heaven, Krucza 16/22, Warsaw. Book via Booksy, Fresha, WhatsApp or Instagram and quote the certificate number. Not exchangeable for cash."

## Not designed yet
The full list, with where each screen is in the code, is in `docs/design/figma-todo.md`.

- empty states
- voucher pricing rules
- delete confirmations (Usuń pytanie / Usuń zabieg)
- the "Kwota" state of Dodaj bon
- the "Edytuj bon" drawer (built as a copy of Dodaj bon) and the "Usunąć zgłoszenie?" dialog (built like "Usunąć zabieg?")
- edit forms for the WhatsApp and Instagram channels
- reordering categories
- the "Info & teksty" screen and its drawers (built in code only)

Also undecided: whether the admin should be available in Ukrainian.
