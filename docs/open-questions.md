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

## Decided (for reference)
- Lowest price stays **"od 80 zł"** (the client's old site said 64 zł; ignore it).
- Names: **Anastazja** and **Ina** everywhere. The privacy policy keeps the legal name Anastasiia Zhelezniak.
- Website has exactly **6 categories**. The Instagram stories have 7 (website 03 = stories 03 + 04).
- Gift section text names all four channels ("…przez Booksy, Fresha, WhatsApp lub Instagram."), and the homepage certificate preview footer says "massageheavenwarsaw.com" (fixed in Figma 2026-11-12).
- One generic "Zarezerwuj wizytę" button everywhere, opening the chooser.
- Instagram: ig.me DM link on mobile, profile link on desktop.
