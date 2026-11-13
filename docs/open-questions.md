# Open questions

Build around these with the placeholder shown. Don't invent answers. Strike an item out when it's resolved, and note the decision.

## To confirm with the client
- [ ] **Cancellation notice:** FAQ 08 says 24 h (placeholder). It also names only Booksy; should it say Booksy, Fresha or a message?
- [ ] **Walking time** from metro Centrum (FAQ 10 says 10 min).
- [ ] **Opening hours:** taken from the door sign draft. Confirm before they go into the JSON-LD and footer.
- [ ] **Privacy policy:** publication date, the analytics tool (or none), and 12-month retention for unanswered voucher enquiries. Needs client/legal sign-off. (Data-protection e-mail filled in: anastaziya111@gmail.com, 2026-11-13.)
- [ ] **Fresha links** use the en-GB locale. Is there a Polish URL?

## Copy
- [ ] **About feature** says "20+ zabiegów". There are 24 now; fine as is unless the client wants the exact number.

## Not designed yet (use a sensible, consistent default)
- [ ] **English review:** the whole English version (`docs/content/*.en.json`, `src/data/ui.en.json`, `privacy-policy.en.md`) was translated by Claude. Please have it read; the privacy policy needs the same legal sign-off as the Polish one.
- [ ] **Names in English:** kept as **Anastazja** and **Ina**, as on the Polish site and the booking platforms. Alternatives would be "Anastasia" or the legal "Anastasiia".
- [ ] Hover states for close buttons, the Contact Instagram block, the map, inline links, service cards, FAQ items, filter chips and the language switch.
- [ ] The map placeholder shown before cookie consent.
- [ ] Gift form "Kwota" state: an amount field (min/max? preset amounts?).
- [ ] Form error states and messages.
- [ ] A 404 page.

## Found while building (step 1, header + footer)
- [ ] **Mobile logo size:** `design-system.md` says 150 px wide; Figma 240:1368 is 218 × 40. Built at 218 to match Figma.
- [ ] **Header between 1024 and 1179 px:** the full desktop nav (logo + 6 links + language switch + button) needs about 1180 px and doesn't fit at 1024. Below 1180 the header keeps the mobile layout (logo + menu button). Confirm or design a compact nav.
- [ ] **Tablet gutter (768–1023):** not specified. Using 40 px side padding.
- [ ] **Language switch font:** Figma 207:1062 uses Inter Regular 12; `design-system.md` says the Label style. Built with Label (Instrument Sans 500, uppercase), so no extra font is loaded.

## Found while building (step 2, components)
- [ ] **Hover colours:** `design-system.md` says secondary/inverse buttons and booking rows get a plum-100 fill on hover. Figma (352:1681, 354:3558) uses periwinkle-100. Built with periwinkle-100 to match Figma.
- [ ] **Team card width:** `design-system.md` says 320 px; Figma 152:104 is 290 px. Built at 290.
- [ ] **Pop-up dim:** the colour isn't in Figma. Using plum-700 at 45 %.
- [ ] **Treatment row "Zarezerwuj":** the Figma component note says it links to Booksy; `website.md` says every booking button opens the general chooser. Built as the chooser (the newer decision).

## Found while building (step 3, sections)
- [ ] **About feature text on mobile:** Figma 240:1241 uses shorter texts ("ul. Krucza 16/22 — łatwy dojazd", "Od terapii po pielęgnację twarzy.") and joins the two paragraphs. Built from `site.json` (the longer texts, two paragraphs), so mobile About is ~74 px taller than Figma. Add mobile variants to the content if the client wants the short ones.
- [ ] **Image descriptions (alt text):** written by Claude for the hero photos and the studio photo, in `src/data/ui.pl.json` → `alt`. Please review.
- [ ] **Map before cookie consent:** built as the Figma placeholder (self-hosted map image + pin, links to Google Maps) plus a "Pokaż mapę" button that opens the cookie settings. The Google iframe loads only after "Funkcjonalne" consent (wired in step 4). Confirm this is the wanted placeholder.
- [ ] **Voucher preview text:** "Gift certificate", the tagline and "Warszawa · Krucza 16/22" aren't in `site.json`; taken from Figma into `src/data/ui.pl.json` → `certificate`.
- [ ] **Team colours:** Figma 151:135 uses a white eyebrow and a periwinkle-300 italic line; `design-system.md` says periwinkle-200 italic on plum. Built as Figma.
- [ ] **Mobile gift section bottom padding:** Figma 240:1273 has 36 px under the voucher; built with the standard 56 px.
- [ ] **Hero buttons at 1024–1100 px:** the three buttons don't fit on one line, so the two secondary ones wrap below "Zarezerwuj wizytę". Not designed; looks fine, confirm.

## Found while building (step 4, pop-ups)
- [ ] **Therapist chooser rows with a note:** in Figma 293:1435 the WhatsApp and Instagram rows stay 72 px and the plum note overlaps the divider. Built so those rows grow to 92 px and nothing overlaps.
- [ ] **Voucher type label:** Figma 165:887 says "Wybrana kwota"; `site.json` says "Kwota". Built with "Kwota" (content wins).
- [ ] **Gift form "Kwota" field:** built as a plain number field "Kwota (zł)", any positive amount. Min/max or preset amounts still to decide.
- [ ] **Form error messages:** written by Claude (`src/data/ui.pl.json` → `giftForm.errors`), shown in plum-100 under each field. Not designed; please review the wording.
- [ ] **Copy for pop-ups:** the gift form, success screen and cookie texts came from Figma into `src/data/ui.pl.json`. The developer may want to move them into `site.json` so the admin panel can edit them.
- [ ] **Analytics hook:** no tool yet. The consent script fires a `mh:consent` event on `window` with the choice; start analytics there when one is chosen.
- [ ] **Mobile menu logo:** the menu uses the 150 px logo (Figma 242:1206), the page header the 218 px one (240:1368). Built as Figma; this also explains the "150 px" in `design-system.md`.

## Found in the final checks (step 6)
- [ ] **Grey text on lavender:** the hero lead and the gift text use neutral-600 instead of Figma's text-secondary, which was below the 4.5:1 contrast minimum there (4.0–4.3:1). Update Figma to match, or pick another colour that passes.
- [ ] **Open Graph image:** none yet (link previews on WhatsApp/Facebook show no picture). Needs a 1200 × 630 image; not designed.
- [ ] **JSON-LD (LocalBusiness):** not added yet; it needs the confirmed opening hours.

## Ukrainian version (2026-11-13)
- [ ] **Native-speaker review:** texts in Figma 540:61 were used as they are; everything else (treatment names, FAQ answers 2–10, team bios, pop-ups, form errors, cookie texts, privacy policy) was translated by Claude. Please have a native speaker read `docs/content/*.ua.json`, `src/data/ui.ua.json` and `privacy-policy.ua.md`.
- [ ] **«ти» vs «ви»:** Figma's hero lead said «Позбавимо вас…» while every other line uses «ти». Built as «Позбавимо тебе…» to match the rest (and the Polish «Cię»).
- [ ] **Privacy policy (UA):** a translation of the Polish draft; it needs the same client/legal sign-off. The legal name stays in Latin letters (Anastasiia Zhelezniak).
- [ ] **Mobile type sizes (UA):** there is no Ukrainian mobile frame. Headings use the Polish mobile sizes scaled by the same ratio as desktop (Display 43, H2 33, H3 22).
- [ ] **Voucher card:** stays Polish/English («Bon podarunkowy / Gift certificate») in Instrument fonts, as in Figma 540:252 — it is the printed design.
- [ ] **Performance (UA, mobile):** Lighthouse 90 vs 96 for Polish, because Ukrainian text needs the Cyrillic and Latin files of both fonts (digits, dashes and brand names are Latin). Fine for now; a merged font subset would close the gap.

## Decided (for reference)
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

## Admin panel prototype (2026-11-13)
Built in `src/admin/` where Figma had no design. Confirm or redesign:
- [ ] **Steps before "Opłacony":** the detail page's main button moves the voucher on one step ("Oznacz jako w kontakcie" → "Oznacz jako opłacony" → "Oznacz jako przekazany" → "Oznacz jako zrealizowany"). Marking as paid opens a small dialog to pick the payment method; the code (MH-XXXX) and the 12-month validity are given at that moment. "Pobierz PDF" and "Wyślij link" are disabled until then.
- [ ] **"Kwota" state of Dodaj bon:** one "Kwota" field (zł) in place of Masaż / Czas / Wartość. Status choices: Opłacony, Przekazany, W kontakcie. Validity choices: 12, 6 or 3 months.
- [ ] **WhatsApp text for amount vouchers:** "…Massage Heaven: bon na 300 zł. Kod …" (Figma only has the massage version).
- [ ] **Delete confirmations** (Usuń osobę / zabieg / pytanie, and the prototype's data reset): a pop-up in the same style as "Wysłałaś bon?": title "Usunąć *osobę?*", what disappears, a grey hint suggesting hiding instead, "Anuluj" (focused) + "Tak, usuń". Not in Figma yet.
- [ ] **Translation pills:** a missing EN/UA translation shows a pink, crossed-out pill (Figma's "Missing" variant).
- [ ] **Hours:** each day has a toggle; off = "nieczynne".
- [ ] **Validity in the sample data:** Anna Wiśniewska's voucher keeps Figma's "9 maja 2027" (6 months), while new vouchers default to 12 months. Same open rule as above.
- [ ] **Team section redesigned to show role and bio ("O mnie")** in all three languages (2026-11-13), not in Figma yet. From 768 px each person is one row: photo (290 px; 240 px on tablet) beside name, role (label style, periwinkle-300), bio (body, periwinkle-200, max 520 px) and the booking link, text centred on the photo, photo on the left in every row. Mobile: stacked. Figma 151:135 / 152:104 still shows the old two-column cards: update it, or tell me what to change.
- [x] **Team portraits were stretched in Figma** (fixed 2026-11-13): replaced with square cut-outs (1732 × 1732, transparent) in `src/assets/team/`; the site and admin show them undistorted.
- [ ] **Photo crop pop-up in the admin** ("Dodaj / Zmień zdjęcie" and "Kadruj"): the photo in the website's plum circle, corners veiled; drag to move, slider / mouse wheel / + − to zoom, arrow keys to move. Saves an 800 × 800 square (never stretched); warns when the crop is under 600 px of real image. Not in Figma yet.
- [ ] **Photo hint in the admin (Zespół):** Figma 403:889 says "Wycięta sylwetka na jednolitym tle…", which reads as if any photo on a plain background works. The panel can't remove a background, so the hint now says: "Zdjęcie z usuniętym tłem (wycięta sylwetka, przezroczyste tło), PNG lub WebP, min. 800 × 800 px. Śliwkowe tło pod spodem dodamy sami." The crop pop-up also warns when an uploaded photo has its own background. Update the Figma text to match.
- [ ] **"Usuń tło" in the photo crop pop-up** (2026-11-13): appears when an uploaded photo has its own background. Runs in the browser (MODNet model via transformers.js, both Apache-2.0); about 5–10 s per photo, "Cofnij — przywróć tło" to undo. On first use it downloads the model (~26 MB) from huggingface.co and the ONNX runtime from cdn.jsdelivr.net (admin only, only after the click; the public site is unaffected). Developer: self-host these files before launch so the admin makes no third-party requests. Edges are good on one person against a calm background; busy backgrounds may need a manual cut-out.

