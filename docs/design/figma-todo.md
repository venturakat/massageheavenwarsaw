# Figma catch-up: screens that were in code but not in Figma

**Status (2026-11-13): done.** Every screen that existed only in code has been drawn in Figma, and the Figma file was tidied up. Node ids are below and in `figma-map.md`. Only the prototype-only "Przywrócić…?" dialog (`App.tsx`) was skipped on purpose: it won't exist in the real panel.

If a new screen is built in code before it's drawn, add it here under "Still to draw".

## Still to draw
- (nothing)

## Admin panel (page "Landing admin" 353:4297)
The frames are in rows that follow the menu order: 01 Logowanie, 02 Bony podarunkowe, 03 Bon przed płatnością, 04 Bon po płatności, 05 Cennik, 06 Zespół, 07 FAQ, 08 Info & teksty. Desktop section 397:87 and mobile section 429:1594 sit side by side, with the rows lined up.

| Screen | Desktop | Mobile |
|---|---|---|
| Bon (nowy): background for the dialogs below, with "Edytuj" and "Usuń zgłoszenie" on the Zamówienie card | 569:6768 | 570:7109 |
| Edytuj bon drawer | 572:8651 | 572:8816 |
| Usunąć zgłoszenie? | 571:7015 | 571:8208 |
| Bon opłacony? (choose Płatność) | 572:9839 | 572:10056 |
| Voucher not found | 572:11328 | 572:11488 |
| Dodaj bon, "Kwota" state | 572:8986 | 572:9324 |
| Usunąć zabieg? | 571:7138 | 571:8336 |
| Cennik: empty category | 572:10877 | 572:11136 |
| Usunąć pytanie? | 571:7244 | 571:8431 |
| FAQ: empty | 572:10367 | 572:10637 |
| Usunąć osobę? | 571:7316 | 571:8504 |
| Kadruj zdjęcie (photo has its own background) | 580:11816 | 580:12026 |
| Kadruj zdjęcie (background removed) | 580:11918 | — |
| Info & teksty: list | (in every desktop frame) | 578:11108 |
| Info & teksty: Pasek na górze strony | 577:10447 | 578:11474 |
| Info & teksty: Start strony (same editor as O nas, Bon, Kontakt) | 576:10068 | 578:11294 |
| Info & teksty: text too long (over-limit warning, "Cofnij zmiany") | 577:10217 | — |
| Info & teksty: O nas (paragraphs and 3 feature boxes) | 577:10663 | — |
| Info & teksty: Dane kontaktowe | 577:11178 | 578:11643 |
| Info & teksty: Godziny otwarcia | 577:11412 | 578:11821 |
| Info & teksty: Okienko rezerwacji | 577:11680 | 578:12033 |
| Info & teksty: channel drawer | 580:11630 | 580:11730 |

Also changed:
- New component **Admin/Info item** (575:10094, Default/Active) in the admin components (393:11).
- Sidebar item renamed to **Info & teksty**, mobile tab to **Info**, in the components and on every screen.
- **Usuń osobę** link added to the Zespół editor footer (403:889, 435:2466).
- Zespół photo hint updated to the new wording on all 9 screens.
- The old "Gabinet i rezerwacje" screens and their channel drawers were deleted (they were replaced by Info & teksty). Their prototype links now go to the new frames: the sidebar "Info & teksty" opens 577:10447 (first item open), the mobile "Info" tab opens the list 578:11108, the channel pencil opens the new drawer. The Info list items and the mobile "← Info & teksty" links are clickable in the prototype too.

These were already in Figma (nothing to draw): password reset 410:1426 / 410:1461 (mobile 429:1643 / 429:1661), add person 454:3160 / 456:4251, edit category 485:5312 / 486:5215, "Wysłałaś bon?" 464:4614 / 464:4752, PDF toast 472:4802 / 472:4914 (component 472:4795).

## Website (page "Landing front" 85:2646)
| Screen | Node |
|---|---|
| 404 page, desktop / mobile | 583:1794 / 583:2104 |
| Footer with the Godziny column: desktop / mobile | 97:151 / 240:1334 (updated) |
| Footer at 1024–1279 (1100 wide, logo above the columns) | 583:1730 |
| Team section with bios and round portraits: desktop / mobile | 151:135 / 240:1299 (updated) |
| New component **Team card (bio)**, Desktop/Mobile | 582:1719 (the old Team card 152:104 is marked as replaced) |

Also changed: the hero lead and the gift text use neutral-600 on both homepages.

The page frames (homepage desktop, homepage mobile, 404 desktop, 404 mobile, footer 1024–1279) are in one labelled row in section 574:14198 "Pages (desktop, mobile)", then the overlay sections (desktop, mobile, in the same order: menu, booking chooser, voucher form, success, privacy policy, cookies), then the services block and components.

Also on the website page: the header top bar (homepages and 404s, 203:1043, 240:1365) and the mobile menu (242:1254) now say "Krucza 16/22, piętro 3" without "ul.", like the site (`site.json` → `studio.addressTopBar`).
