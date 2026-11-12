# Website behaviour

A single page. Nothing navigates away except external links (which open in a new tab).

## Header and navigation
- The header is fixed. Desktop: top bar (address "ul. Krucza 16/22, piętro 3") + logo + links + language switch + "Zarezerwuj wizytę" button.
- Nav links scroll to their sections: Cennik → Services, O nas → About, FAQ, Bon podarunkowy → Gift, Zespół → Team, Kontakt → Contact. The logo scrolls to the top. The footer "Menu" column has the same six links.
- Mobile: the menu button opens a full-screen menu overlay. It has the logo, a close button, the six links (large serif with arrows and dividers), the language switch, a full-width "Zarezerwuj wizytę" button and the address. Tapping a link closes the menu, then scrolls. The button swaps the menu for the reservation chooser sheet.

## Booking: the reservation chooser
**Every** booking button says "Zarezerwuj wizytę" (treatment rows say "Zarezerwuj") and opens the **general chooser**. That includes the nav, hero, every treatment row, the category panels, contact, and the gift-section note. No button goes straight to one channel. The only exception is the footer "Online" column, which links directly to Booksy, Fresha, WhatsApp and Instagram.

Chooser content (title "Zarezerwuj *wizytę*"):
- Group **"Rezerwacja online"**:
  - Booksy → https://massageheaven68.booksy.com/a
  - Fresha → https://www.fresha.com/en-GB/a/massage-heaven-warszawa-krucza-16-22-j9nsos6o/all-offer?pId=2749004
- Group **"Napisz do nas"**:
  - WhatsApp → `https://wa.me/48731711509?text=` + a prefilled message
  - Instagram → see "Instagram links" below

The team-card links open the **therapist chooser**, with the same layout but personal links and copy.

All titles, hints, notes and URLs are in `docs/content/site.json` → `booking`. That file is the source; the admin panel will edit it later. The general WhatsApp prefill is "Dzień dobry! Chcę umówić wizytę w Massage Heaven."

Desktop: a centred 440 px card with a dim. Mobile: a bottom sheet. Esc, the close button and a click on the dim close it.

### Instagram links
- On **mobile**, "Napisz na Instagramie" and the chooser's Instagram option use the DM link `https://ig.me/m/massage_heaven_warsaw`.
- On **desktop**, they use the profile link `https://www.instagram.com/massage_heaven_warsaw/`. ig.me doesn't work on Instagram Web.
- Pick the link with `matchMedia('(hover: none) and (pointer: coarse)')` at click time, or render both and show one with CSS.

## Services
- There are 6 category cards in a 3-column grid on desktop and one column on mobile. Data: `docs/content/services.json`.
- Each card's "od X zł" is **calculated** from the lowest price in its category. The short treatment list on the card comes from the data (`cardList`).
- **Click a card:**
  - The card turns Active (plum).
  - Its panel opens below the card's grid row on desktop, or right under the card on mobile.
  - The panel has a header (number, name, tagline), the treatment rows and a footer: "Nie wiesz, który wybrać? Napisz do nas — doradzimy."
  - Only one panel is open at a time. Clicking the active card or "Zwiń" closes it, and the page scrolls so the panel is in view.
- **Search** ("Szukaj zabiegu…") filters treatments by name, ignoring case and Polish diacritics.
  - Results: "N zabiegi dla „query”" (use correct Polish plurals: 1 zabieg, 2–4 zabiegi, 5+ zabiegów) + matching treatment rows + "Wyczyść wyszukiwanie".
  - No results: "Nie znaleźliśmy „query”" + "Sprawdź pisownię albo wybierz kategorię. Możesz też napisać do nas — doradzimy, który masaż będzie najlepszy." + category chips that open that category.
- See all states in Figma component set 164:1339.

## FAQ
- 10 items from `docs/content/faq.json`. Items open and close independently (250 ms). The first item is open on load.
- Use `<details>/<summary>` or buttons with `aria-expanded`.
- Under the title: "Nie ma tu Twojego pytania? Napisz do nas na Instagramie — chętnie pomożemy." "Instagramie" links to Instagram (same mobile/desktop rule).

## Gift voucher (Bon podarunkowy)
The "Zamów bon" button opens the form pop-up (desktop 165:887, mobile full screen 251:1191).

Fields, in order:
1. **Rodzaj bonu:** segmented control "Konkretny masaż" / "Kwota".
2. **Masaż** (select of all treatments) + **Czas trwania** (select, filled from the chosen treatment's durations). For "Kwota": an amount field instead.
3. **Dla kogo (opcjonalnie)**, placeholder "Imię — wpiszemy je na bonie". Max 40 characters.
4. **Twoje imię** (max 40 characters) + **Telefon** (Polish format, +48 optional).
5. **Wiadomość (opcjonalnie)**, placeholder "Masz pytanie albo prośbę? Napisz tutaj." This is not printed on the voucher.
6. **Consent** checkbox, required. Its link opens the privacy policy pop-up on top of the form.

Submit → validate → the form swaps to the success screen "Bon wysłany" (165:947) with "Zamknij".

**Phase 1:** submitting doesn't send anything. Put a single `submitVoucherRequest(data)` function in place that the developer will wire to the back end.

## Privacy policy
- Text: `docs/content/privacy-policy.pl.md`.
- Opens from the footer "Polityka prywatności", the gift form consent link and the cookie banner text.
- Desktop: a 720×760 pop-up that scrolls inside. Mobile: full screen.
- Placeholders in [brackets] are shown in plum until they're filled in.

## Cookies
- **Banner:** appears about 0.8 s after the first visit, bottom left on desktop and a bottom card on mobile.
  - Title "Pliki *cookies*", a short text with a link to the policy.
  - Two equal buttons: "Tylko niezbędne" (secondary) and "Akceptuję wszystkie" (primary). Rejecting must be as easy as accepting.
  - Link "Ustawienia cookies".
- **Settings** pop-up, with three rows:
  - Niezbędne — "Zawsze aktywne"
  - Funkcjonalne — Google map, toggle
  - Analityczne — toggle
  - Toggles are off by default. Buttons "Zapisz wybór" and "Akceptuję wszystkie".
- The footer "Ustawienia cookies" link reopens the settings.
- Store the choice in localStorage, with a version number so the banner can be shown again when the policy changes.
- **Funkcjonalne off:** don't load the Google map iframe. Show a placeholder (a styled box with "Pokaż mapę" that opens the settings, plus the address and a "Zobacz na mapie" link to https://maps.app.goo.gl/JGEJEcDB9WyVuLMB8).
- **Analityczne off:** load no analytics. There is no analytics tool yet; leave a hook for the developer.

## Language switch
- PL / EN / UA. It switches routes (`/` → `/en/` → `/ua/`) and keeps the scroll position or anchor if possible.
- Set `<html lang>` (pl, en, uk) and `hreflang` alternates.
- Only Polish copy exists. EN and UA show the Polish text until translations arrive.

## Other links
- **Google Maps** (https://maps.app.goo.gl/JGEJEcDB9WyVuLMB8): "Zobacz na mapie" (hero), the map, the Contact address and the footer address.
- **"Zobacz cennik"** (hero) scrolls to Services.
- **Contact:**
  - "Zarezerwuj wizytę" opens the chooser.
  - "Napisz na Instagramie" follows the Instagram rule.
  - The "Instagram" detail links to the profile.
  - The "Rezerwacje" value (Booksy · Fresha · WhatsApp) opens the chooser.

## SEO basics
- Title: "Massage Heaven — masaż w centrum Warszawy".
- Meta description from the hero lead text.
- Open Graph image.
- LocalBusiness / HealthAndBeautyBusiness JSON-LD with the address, phone, opening hours and a link to Booksy.
