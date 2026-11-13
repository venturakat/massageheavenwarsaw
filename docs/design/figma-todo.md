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
- [ ] **Empty states:** "Nie ma jeszcze pytań." (FAQ), "W tej kategorii nie ma jeszcze zabiegów." (Cennik), and "voucher not found" (`VoucherDetail.tsx`, `.empty-state`).

## Admin panel: check first
These are in code but may already be in Figma.

- [ ] **Kadruj zdjęcie** (photo crop pop-up, square crop, optional background removal). Code: `src/admin/PhotoCropper.tsx`. Opens when you upload a photo in Zespół.
- [ ] **Zespół: add / edit person form** and the photo placeholder. Code: `Team.tsx`.
- [ ] **Edit category** drawer (Cennik → edit category name and tagline). Code: `Pricing.tsx` → `CategoryDrawer`.
- [ ] **Booking channel** drawer (Gabinet i rezerwacje). Code: `Studio.tsx` → `ChannelDrawer`.
- [ ] **Oznacz jako opłacony** dialog (choose Płatność) and the **Wysłałaś bon?** dialog with the message preview. Code: `VoucherDetail.tsx`.
- [ ] **Toast** "PDF pobrany…" with the link "Oznacz teraz". Code: `ui.tsx` → `Toast`.
- [ ] **Login: password reset** screens (3 states). Code: `Login.tsx`.
- [ ] **"Przywrócić…?"** dialog (reset prototype data). Code: `App.tsx`. Prototype only, so it can be skipped.

## Public website: check first
- [ ] **Team section** after the redesign with bios and square portraits (PR #11, #12). Figma 151:135 and the team card 152:104 may still show the old cards. Code: `src/components/sections/Team.astro`, `TeamCard.astro`.
