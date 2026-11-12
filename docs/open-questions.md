# Open questions

Build around these with the placeholder shown. Don't invent answers. Strike an item out when it's resolved, and note the decision.

## To confirm with the client
- [ ] **Cancellation notice:** FAQ 08 says 24 h (placeholder). It also names only Booksy; should it say Booksy, Fresha or a message?
- [ ] **Walking time** from metro Centrum (FAQ 10 says 10 min).
- [ ] **Opening hours:** taken from the door sign draft. Confirm before they go into the JSON-LD and footer.
- [ ] **Privacy policy:** data-protection e-mail, publication date, the analytics tool (or none), and 12-month retention for unanswered voucher enquiries. Needs client/legal sign-off.
- [ ] **Fresha links** use the en-GB locale. Is there a Polish URL?

## Copy
- [ ] **About feature** says "20+ zabiegów". There are 24 now; fine as is unless the client wants the exact number.

## Not designed yet (use a sensible, consistent default)
- [ ] EN and UA translations (only the language switch exists).
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
- [ ] **Cyrillic:** Instrument Serif and Instrument Sans have no Cyrillic glyphs (only latin + latin-ext). The UA translation will fall back to the system font. Pick a Cyrillic fallback font, or accept it.

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
- [ ] **Google map embed:** uses the keyless `google.com/maps?q=…&output=embed` URL built from the address. Swap for an official embed URL from Google Maps → Share → Embed if preferred.
- [ ] **Analytics hook:** no tool yet. The consent script fires a `mh:consent` event on `window` with the choice; start analytics there when one is chosen.
- [ ] **Mobile menu logo:** the menu uses the 150 px logo (Figma 242:1206), the page header the 218 px one (240:1368). Built as Figma; this also explains the "150 px" in `design-system.md`.

## Decided (for reference)
- Lowest price stays **"od 80 zł"** (the client's old site said 64 zł; ignore it).
- Names: **Anastazja** and **Ina** everywhere. The privacy policy keeps the legal name Anastasiia Zhelezniak.
- Website has exactly **6 categories**. The Instagram stories have 7 (website 03 = stories 03 + 04).
- Gift section text names all four channels ("…przez Booksy, Fresha, WhatsApp lub Instagram."), and the homepage certificate preview footer says "massageheavenwarsaw.com" (fixed in Figma 2026-11-12).
- One generic "Zarezerwuj wizytę" button everywhere, opening the chooser.
- Instagram: ig.me DM link on mobile, profile link on desktop.
