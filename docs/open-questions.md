# Open questions

Everything the designer and client could decide is decided (see "Decided"). What's left is for the developer (phase 2) and for Figma.

New questions: build around them with a sensible default, don't invent answers, add them here, and move them to "Decided" with the answer once resolved.

## For the developer (phase 2)
- [ ] **Privacy policy — the developer updates it (2026-11-13):** publication date, the analytics tool (or none), and 12-month retention for unanswered voucher enquiries, in all three languages (`privacy-policy.pl.md`, `.en.md`, `.ua.md`; the UA one keeps the legal name in Latin letters). Data-protection e-mail already filled in: anastaziya111@gmail.com.
- [ ] **Analytics hook:** no tool yet. The consent script fires a `mh:consent` event on `window` with the choice; start analytics there when one is chosen.
- [ ] **"Usuń tło" in the photo crop pop-up** (2026-11-13): appears when an uploaded photo has its own background. Runs in the browser (MODNet model via transformers.js, both Apache-2.0); about 5–10 s per photo, "Cofnij — przywróć tło" to undo. On first use it downloads the model (~26 MB) from huggingface.co and the ONNX runtime from cdn.jsdelivr.net (admin only, only after the click; the public site is unaffected). Developer: self-host these files before launch so the admin makes no third-party requests. Edges are good on one person against a calm background; busy backgrounds may need a manual cut-out.

## Figma
- [ ] Screens and states built in code but not drawn in Figma yet (admin dialogs and drawers, the 404 page, the footer with opening hours, the team section with bios, the photo crop pop-up): see `docs/design/figma-todo.md`. Paused until the Figma connector works.
- [ ] Small Figma text/colour updates to match the site: the darker grey on lavender (neutral-600, hero lead and gift text) and the admin photo hint text (Zespół). Also listed in `docs/design/figma-todo.md`.

## Decided (for reference)
- Client answers (2026-11-13):
  - **WhatsApp text for amount vouchers** (designer's pick, 2026-11-13): "Dzień dobry! Przesyłam bon podarunkowy Massage Heaven o wartości 300 zł, do wykorzystania na dowolny zabieg z naszego cennika. Kod MH-XXXX, ważny do <data>. / Bon w PDF: <link> / Przy rezerwacji wystarczy podać kod. Do zobaczenia na Kruczej 16/22!" (`src/admin/format.ts` → `whatsappMessage`).
  - **Open Graph image:** `public/og-image.png` (1200 × 630), exported by the designer from the Figma page Booksy / Google / Facebook / WhatsApp. Same image on every language; also the JSON-LD `image`.
  - **Voucher rules:** an amount voucher is at least the **lowest price in the price list** (now 80 zł; read from the prices, so it follows price changes), with **no maximum**. Every voucher is **valid for 12 months**. Website form: label "Kwota (od 80 zł)" and the error "Najniższa kwota bonu to 80 zł."; admin "Dodaj / Edytuj bon": the same minimum, and "Ważny" is fixed at 12 months. The sample voucher of Anna Wiśniewska now runs to 9 Nov 2027.
  - **Opening hours** in `site.json` → `studio.hours` are confirmed. Shown in a new footer column **Godziny / Hours / Години** (the designer's choice, not in Figma yet; see `docs/design/figma-todo.md`) and in the Google business info (JSON-LD) on every homepage.
  - **Cancellation notice** 24 h (FAQ 08) is fine; the wording stays as it is.
  - **Walking time** from metro Centrum, 10 min (FAQ 10), is fine.
  - **Fresha:** Polish links (`fresha.com/pl/…`). The general one is the client's link; the two therapist links are the same pages with `pl` instead of `en-GB`.
  - **Native-speaker review** of the English and Ukrainian texts is done.
- Privacy policy: the developer updates it in phase 2 (see "To confirm with the client").
- JSON-LD: `HealthAndBeautyBusiness` built from `site.json` (`src/data/structured-data.ts`), on the PL/EN/UA homepages, not on the 404 page (2026-11-13).
- Client e-mail: anastaziya111@gmail.com — the data-protection contact in all three privacy policies, and `studio.email` in `site.json` (2026-11-13).
- English (`/en/`): same layout and Instrument fonts as Polish, text from the `*.en.json` files; British spelling; «zł» kept in prices (2026-11-13).
- Ukrainian fonts: Playfair Display (Regular + Italic) and Onest (400/500/600), from the Figma «Cyrillic test» page (540:61), self-hosted and loaded only on `/ua/`. Ukrainian sizes: Display 75, H2 48, H3 25, H4 20, headings tracked −5 % / −3 % (2026-11-13).
- Mobile booking choosers and cookie settings: a card centred on screen, 12 px from the sides, all corners rounded, instead of Figma's edge-to-edge bottom sheet (2026-11-13).
- Map: the live map embeds the Massage Heaven place itself (`site.json` → `studio.googleMapsEmbed`, same place as the `googleMaps` link), with the Figma rings and brand pin on top (2026-11-13).
- Hero and team photos: shown exactly as in Figma, which stretches each photo to its arch/circle. When the client supplies new photos, export them already cropped to the shape (342 × 420, 263 × 323, 290 × 290 at 2×) so nothing is distorted.
- Favicon: the round plum brand icon (Figma 45:1940) for browser tabs; the iPhone home-screen icon (`apple-touch-icon.png`) stays the square one (45:1936), because iOS rounds it itself and would fill round icons' transparent corners with black (2026-11-13).
- Lowest price stays **"od 80 zł"** (the client's old site said 64 zł; ignore it).
- Names: **Anastazja** and **Ina** everywhere. The privacy policy keeps the legal name Anastasiia Zhelezniak.
- Website has exactly **6 categories**. The Instagram stories have 7 (website 03 = stories 03 + 04).
- Gift section text names all four channels ("…przez Booksy, Fresha, WhatsApp lub Instagram."), and the homepage certificate preview footer says "massageheavenwarsaw.com" (fixed in Figma 2026-11-12).
- One generic "Zarezerwuj wizytę" button everywhere, opening the chooser.
- Instagram: ig.me DM link on mobile, profile link on desktop.

### Accepted by the designer (2026-11-13)
Built in code where Figma or the docs were silent or disagreed; the designer kept every one as built.

- **Copy for pop-ups:** the gift form, success screen and cookie texts came from Figma into `src/data/ui.pl.json`. The developer may want to move them into `site.json` so the admin panel can edit them. **Not needed (designer, 2026-11-13): stays as it is.**
- **Performance (UA, mobile):** Lighthouse 90 vs 96 for Polish, because Ukrainian text needs the Cyrillic and Latin files of both fonts (digits, dashes and brand names are Latin). Fine for now; a merged font subset would close the gap. **Not needed (designer, 2026-11-13): stays as it is.**

- **About feature** says "20+ zabiegów". There are 24 now; fine as is unless the client wants the exact number.
- **Names in English:** kept as **Anastazja** and **Ina**, as on the Polish site and the booking platforms. Alternatives would be "Anastasia" or the legal "Anastasiia".
- Hover states for close buttons, the Contact Instagram block, the map, inline links, service cards, FAQ items, filter chips and the language switch.
- The map placeholder shown before cookie consent.
- Form error states and messages.
- **404 page** (built 2026-11-13, not in Figma): in the hero's style — eyebrow "Błąd 404", title "Tej strony / *tu nie ma*", a short line, "Wróć na stronę główną" + "Zarezerwuj wizytę" (opens the chooser), no photo. PL/EN/UA. Copy in `src/data/ui.*.json` → `notFound`; please review the wording. Listed in `docs/design/figma-todo.md`.
- **Mobile logo size:** `design-system.md` says 150 px wide; Figma 240:1368 is 218 × 40. Built at 218 to match Figma.
- **Header between 1024 and 1179 px:** the full desktop nav (logo + 6 links + language switch + button) needs about 1180 px and doesn't fit at 1024. Below 1180 the header keeps the mobile layout (logo + menu button). Confirm or design a compact nav.
- **Tablet gutter (768–1023):** not specified. Using 40 px side padding.
- **Language switch font:** Figma 207:1062 uses Inter Regular 12; `design-system.md` says the Label style. Built with Label (Instrument Sans 500, uppercase), so no extra font is loaded.
- **Hover colours:** `design-system.md` says secondary/inverse buttons and booking rows get a plum-100 fill on hover. Figma (352:1681, 354:3558) uses periwinkle-100. Built with periwinkle-100 to match Figma.
- **Team card width:** `design-system.md` says 320 px; Figma 152:104 is 290 px. Built at 290.
- **Pop-up dim:** the colour isn't in Figma. Using plum-700 at 45 %.
- **Treatment row "Zarezerwuj":** the Figma component note says it links to Booksy; `website.md` says every booking button opens the general chooser. Built as the chooser (the newer decision).
- **About feature text on mobile:** Figma 240:1241 uses shorter texts ("ul. Krucza 16/22 — łatwy dojazd", "Od terapii po pielęgnację twarzy.") and joins the two paragraphs. Built from `site.json` (the longer texts, two paragraphs), so mobile About is ~74 px taller than Figma. Add mobile variants to the content if the client wants the short ones.
- **Image descriptions (alt text):** written by Claude for the hero photos and the studio photo, in `src/data/ui.pl.json` → `alt`. Please review.
- **Map before cookie consent:** built as the Figma placeholder (self-hosted map image + pin, links to Google Maps) plus a "Pokaż mapę" button that opens the cookie settings. The Google iframe loads only after "Funkcjonalne" consent (wired in step 4). Confirm this is the wanted placeholder.
- **Voucher preview text:** "Gift certificate", the tagline and "Warszawa · Krucza 16/22" aren't in `site.json`; taken from Figma into `src/data/ui.pl.json` → `certificate`.
- **Team colours:** Figma 151:135 uses a white eyebrow and a periwinkle-300 italic line; `design-system.md` says periwinkle-200 italic on plum. Built as Figma.
- **Mobile gift section bottom padding:** Figma 240:1273 has 36 px under the voucher; built with the standard 56 px.
- **Hero buttons at 1024–1100 px:** the three buttons don't fit on one line, so the two secondary ones wrap below "Zarezerwuj wizytę". Not designed; looks fine, confirm.
- **Therapist chooser rows with a note:** in Figma 293:1435 the WhatsApp and Instagram rows stay 72 px and the plum note overlaps the divider. Built so those rows grow to 92 px and nothing overlaps.
- **Voucher type label:** Figma 165:887 says "Wybrana kwota"; `site.json` says "Kwota". Built with "Kwota" (content wins).
- **Form error messages:** written by Claude (`src/data/ui.pl.json` → `giftForm.errors`), shown in plum-100 under each field. Not designed; please review the wording.
- **Mobile menu logo:** the menu uses the 150 px logo (Figma 242:1206), the page header the 218 px one (240:1368). Built as Figma; this also explains the "150 px" in `design-system.md`.
- **Grey text on lavender:** the hero lead and the gift text use neutral-600 instead of Figma's text-secondary, which was below the 4.5:1 contrast minimum there (4.0–4.3:1). Update Figma to match, or pick another colour that passes.
- **«ти» vs «ви»:** Figma's hero lead said «Позбавимо вас…» while every other line uses «ти». Built as «Позбавимо тебе…» to match the rest (and the Polish «Cię»).
- **Mobile type sizes (UA):** there is no Ukrainian mobile frame. Headings use the Polish mobile sizes scaled by the same ratio as desktop (Display 43, H2 33, H3 22).
- **Voucher card:** stays Polish/English («Bon podarunkowy / Gift certificate») in Instrument fonts, as in Figma 540:252 — it is the printed design.
- **Steps before "Opłacony":** the detail page's main button moves the voucher on one step ("Oznacz jako w kontakcie" → "Oznacz jako opłacony" → "Oznacz jako przekazany" → "Oznacz jako zrealizowany"). Marking as paid opens a small dialog to pick the payment method; the code (MH-XXXX) and the 12-month validity are given at that moment. "Pobierz PDF" and "Wyślij link" are disabled until then.
- **Edit an unpaid voucher** (2026-11-13): while a voucher is Nowy or W kontakcie, an "Edytuj" link (pencil icon) at the top right of the "Zamówienie" card opens the "Dodaj bon" drawer as "Edytuj bon", filled in, with "Zapisz zmiany". She can change the type, massage, duration, amount, Kupujący, Telefon and Dla kogo. Status, payment and validity are hidden (they're set when she marks it as paid). The link disappears once the voucher is paid. Not in Figma yet.
- **Delete an unpaid request** (2026-11-13): while a voucher is Nowy or W kontakcie, a muted "Usuń zgłoszenie" link (trash icon) at the bottom of the "Zamówienie" card. It asks "Usunąć *zgłoszenie?*" (same style as the other delete confirmations, hint: "Usuwaj tylko, gdy klient zrezygnował. Gdy chce coś zmienić, użyj „Edytuj”."), then removes the voucher and goes back to the list. Paid vouchers can't be deleted. Not in Figma yet.
- **"Kwota" state of Dodaj bon:** one "Kwota" field (zł) in place of Masaż / Czas / Wartość. Status choices: Opłacony, Przekazany, W kontakcie. Validity is fixed at 12 months (shown, not editable).
- **Delete confirmations** (Usuń osobę / zabieg / pytanie, and the prototype's data reset): a pop-up in the same style as "Wysłałaś bon?": title "Usunąć *osobę?*", what disappears, a grey hint suggesting hiding instead, "Anuluj" (focused) + "Tak, usuń". Not in Figma yet.
- **Translation pills:** a missing EN/UA translation shows a pink, crossed-out pill (Figma's "Missing" variant).
- **Hours:** each day has a toggle; off = "nieczynne".
- **Team section redesigned to show role and bio ("O mnie")** in all three languages (2026-11-13), not in Figma yet. From 768 px each person is one row: photo (290 px; 240 px on tablet) beside name, role (label style, periwinkle-300), bio (body, periwinkle-200, max 520 px) and the booking link, text centred on the photo, photo on the left in every row. Mobile: stacked. Figma 151:135 / 152:104 still shows the old two-column cards: update it, or tell me what to change.
- **Photo crop pop-up in the admin** ("Dodaj / Zmień zdjęcie" and "Kadruj"): the photo in the website's plum circle, corners veiled; drag to move, slider / mouse wheel / + − to zoom, arrow keys to move. Saves an 800 × 800 square (never stretched); warns when the crop is under 600 px of real image. Not in Figma yet.
- **Photo hint in the admin (Zespół):** Figma 403:889 says "Wycięta sylwetka na jednolitym tle…", which reads as if any photo on a plain background works. The panel can't remove a background, so the hint now says: "Zdjęcie z usuniętym tłem (wycięta sylwetka, przezroczyste tło), PNG lub WebP, min. 800 × 800 px. Śliwkowe tło pod spodem dodamy sami." The crop pop-up also warns when an uploaded photo has its own background. Update the Figma text to match.
- **Team portraits were stretched in Figma** (fixed 2026-11-13): replaced with square cut-outs (1732 × 1732, transparent) in `src/assets/team/`; the site and admin show them undistorted.
