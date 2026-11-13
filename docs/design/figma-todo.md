# Figma to-do: screens that are in code but not in Figma

**Status (2026-11-13): on pause.** The Figma connector stopped working, so nothing below has been drawn yet. When it works again, start a new session and ask: *"build in Figma the screens in docs/design/figma-todo.md"*.

How to work through the list:
1. For every item marked **check**, look in Figma first (page "Landing back end" 353:4297, desktop section 397:87, mobile section 429:1594). It may already be drawn. If it is, write its node id in `figma-map.md` and tick it off here.
2. Build what's missing in the style of the existing admin screens: use the admin components (393:11) and the colour/type variables. Desktop 1440 × 900 goes in 397:87, mobile 390 × 844 in 429:1594.
3. Compare each new frame with the running prototype: `npm run dev` → `http://localhost:4321/admin`, password `demo`.
4. Add the new node ids to `figma-map.md` and remove the item from "Not designed yet" in `docs/behaviour/admin-and-vouchers.md`.

## Admin panel: known to be missing
The docs say these aren't designed yet.

- [ ] **Edytuj bon** drawer (desktop + mobile). Code: `src/admin/screens/VoucherForm.tsx` in edit mode. It's the "Dodaj bon" drawer titled "Edytuj bon", without Status, Płatność and Ważny, and the button says "Zapisz zmiany". Open it from a voucher that is *Nowy* or *W kontakcie* → "Edytuj" on the Zamówienie card.
- [ ] **Usunąć zgłoszenie?** confirmation (desktop + mobile). Code: `VoucherDetail.tsx` (ConfirmDialog, "Tak, usuń"). Also draw the "Usuń zgłoszenie" link at the bottom of the Zamówienie card. From branch `feat/voucher-delete`.
- [ ] **Dodaj bon in the "Kwota" state**: Rodzaj bonu = Kwota. Code: `VoucherForm.tsx`.
- [ ] **Delete confirmations:** "Usunąć pytanie?" (`Faq.tsx`), "Usunąć zabieg?" (`Pricing.tsx`) and deleting a person (`Team.tsx`). They all use the same ConfirmDialog as the voucher one.
- [ ] **Info & teksty** screen (desktop + mobile), which replaced "Gabinet i rezerwacje" (404:1238 / 436:2841). Code: `src/admin/screens/Info.tsx`. It uses the Zespół layout (403:889 desktop, 435:2354 / 435:2466 mobile): a list of 8 numbered items on the left and an editor card on the right. Draw the list and the editors: section texts (Start, O nas, Bon, Kontakt) with the heading preview, character counter and the over-limit warning; Pasek na górze strony; Dane kontaktowe; Godziny otwarcia; Okienko rezerwacji. Rename the sidebar item to "Info & teksty" and the mobile tab to "Info" in the admin components (393:11).
- [ ] **Empty states:** "Nie ma jeszcze pytań." (FAQ), "W tej kategorii nie ma jeszcze zabiegów." (Cennik), and "voucher not found" (`VoucherDetail.tsx`, `.empty-state`).

## Admin panel: check first
These are in code but may already be in Figma.

- [ ] **Kadruj zdjęcie** (photo crop pop-up, square crop, optional background removal). Code: `src/admin/PhotoCropper.tsx`. Opens when you upload a photo in Zespół.
- [ ] **Zespół: add / edit person form** and the photo placeholder. Code: `Team.tsx`.
- [ ] **Edit category** drawer (Cennik → edit category name and tagline). Code: `Pricing.tsx` → `CategoryDrawer`.
- [ ] **Booking channel** drawer (now in Info & teksty). Code: `Info.tsx` → `ChannelDrawer`.
- [ ] **Oznacz jako opłacony** dialog (choose Płatność) and the **Wysłałaś bon?** dialog with the message preview. Code: `VoucherDetail.tsx`.
- [ ] **Toast** "PDF pobrany…" with the link "Oznacz teraz". Code: `ui.tsx` → `Toast`.
- [ ] **Login: password reset** screens (3 states). Code: `Login.tsx`.
- [ ] **"Przywrócić…?"** dialog (reset prototype data). Code: `App.tsx`. Prototype only, so it can be skipped.

## Public website: known to be missing
- [ ] **404 page** (desktop + mobile; PL is enough). Code: `src/components/NotFoundPage.astro`. See it with `npm run build && npm run preview` → any unknown URL.

- [ ] **Footer with the opening-hours column** (desktop 1440, 1024–1279 with the logo above the columns, and mobile). Code: `src/components/Footer.astro`. Columns: **Godziny**, Menu, Studio, Online (mobile: Godziny + Menu, then Studio + Online). Footer-only short labels: "Bon", "Warszawa". Days with the same hours are joined ("Czw–Pt 8:30–23:00"); day names in the muted footer colour. Figma footer: desktop 97:151, mobile 240:1334.

- [ ] **Small updates to match the site:** the hero lead and the gift text use neutral-600 (Figma's text-secondary is below the 4.5:1 contrast minimum on lavender); the admin photo hint (Zespół, Figma 403:889) should read "Zdjęcie z usuniętym tłem (wycięta sylwetka, przezroczyste tło), PNG lub WebP, min. 800 × 800 px. Śliwkowe tło pod spodem dodamy sami."

## Public website: check first
- [ ] **Team section** after the redesign with bios and square portraits (PR #11, #12). Figma 151:135 and the team card 152:104 may still show the old cards. Code: `src/components/sections/Team.astro`, `TeamCard.astro`.
