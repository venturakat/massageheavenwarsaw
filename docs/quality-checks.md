# Quality checks (build step 6)

Run on 2026-11-12 against the production build (`npm run build && npm run preview`),
Chrome headless, Lighthouse 12.6.1. Re-run after any larger change.

## Lighthouse
| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` mobile | 96 | 100 | 100 | 100 |
| `/` desktop | 100 | 100 | 100 | 100 |
| `/en/` mobile | 96 | 100 | 100 | 63 * |

\* `/en/` and `/ua/` carry `noindex` until they're translated (see `docs/content/translations.md`).
Lighthouse marks that down on purpose; the score returns to 100 once the language exists.

Mobile: LCP 2.6–2.7 s, CLS 0. Desktop: LCP 0.6 s, CLS 0.

Fixed during this step:
- **Contrast:** grey text on the lavender backgrounds (hero lead, gift text) was 4.0–4.3:1. Now neutral-600 (6.8:1).
- **Favicon:** missing (a 404 in the console). Added from the Figma brand icon 45:1936: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png` in `public/`.
- **Fonts:** the four above-the-fold fonts are preloaded (Sans 400/600, Serif 400 regular + italic). That removed a font-swap layout shift on desktop and cut mobile Speed Index from 4.9 s to 2.0 s.
- **Hero photo:** loads with `fetchpriority="high"` (it is the LCP image).

Known, accepted: the page has ~1,800 DOM elements (Lighthouse warns above 1,400). Most are the
24 treatments, rendered once in their panels and once in the hidden search results. Rendering
the search results from the panels in JavaScript would halve that if it ever matters.

## Keyboard
- Tab order follows the page: skip link → header → hero → search → cards → FAQ → gift → team → contact → map → footer.
- Every focus stop has a visible ring (the search field's ring is drawn around the whole pill).
- Closed panels, closed FAQ answers and closed pop-ups are skipped.
- Service card: Enter opens its panel; the next Tab goes into that panel.
- Pop-ups: focus moves inside, cycles inside (the page behind is inert), Esc closes, focus returns to the opener.
- Menu (below 1180 px): links close the menu, then scroll; "Zarezerwuj wizytę" swaps it for the chooser.

## Widths
No horizontal scroll or overflow at 390, 768, 1280 or 1440 px.
- 1440: content 1120 px wide, centred.
- 1180 and up: full desktop nav; below it, logo + menu button.
- 1024–1279: desktop layout scaled (hero photos and voucher card shrink).
- 768–1023: mobile layout in a 40 px gutter.
- Touch screens: small text links get a larger invisible tap area (≥ 33 px tall).

## Compared with Figma
Desktop 1280 (95:14), section start / height:

| Section | Figma | Site |
|---|---|---|
| Hero | 114 / 533 | 115 / 533 |
| Services | 647 / 1071 | 648 / 1071 |
| About | 1718 / 660 | 1719 / 660 |
| FAQ | 2378 / 1030 | 2379 / 1030 |
| Gift | 3408 / 520 | 3409 / 520 |
| Team | 3928 / 699 | 3929 / 699 |
| Contact | 4627 / 608 | 4628 / 608 |
| Footer | 5235 / 388 | 5236 / 388 |
| Page | 5623 | 5624 |

The 1 px offset is the header (115 px; Figma 114.99).

Mobile 390 (240:1064): the page is 7800 px vs Figma 7710. The difference is all content
or spacing decisions already listed in `docs/open-questions.md` (About +74 px: longer
feature text in `site.json`; Gift +20 px: standard bottom padding). Every other section
matches to within 1–3 px.

Pop-ups were checked against their Figma frames when built (step 4): chooser 440 px,
privacy 720 × 760, gift form 720 wide, cookie banner 400 × 251, menu link rows 60 px.
