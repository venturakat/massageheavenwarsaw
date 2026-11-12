# Design system

All values are in `tokens.css`. This file explains how to use them. Check details in Figma (`figma-map.md`) when in doubt.

## Brand
- **Logo:** the wordmark "massage heaven" ("massage" upright serif, "heaven" italic, a halo ellipse over the "m"). The monogram is the "m" + halo. Colour versions: Ink, Plum, Periwinkle, White. Export them as SVG from Figma, Components page → Logo set 47:75.
- **Clear space:** ½ the logo height on every side. **Minimum size:** wordmark 120 px wide, monogram 24 px wide.
- **Main colours:** Plum #832F66 (primary actions, highlights), Periwinkle #7182DE (accent), Ink #232327 (text).
- **Motifs:**
  - Arch-topped photo frames: radius = ½ width, square bottom.
  - A thin halo ellipse outline (periwinkle-300) floats above the arch, about ⅔ of the arch width.
  - Black-and-white massage photos, sometimes with a plum tint.
- **Headings:** Instrument Serif. Display and H2 headings have a second line or last word in *italic*: plum on light backgrounds, periwinkle-200 on plum backgrounds. Example: "Chwila tylko / *dla Ciebie*". In markup, wrap the italic part in `<em>`.

## Type scale
| Style | Desktop | Mobile (<768) | Font |
|---|---|---|---|
| Display (+ italic) | 80 / 0.94, −1.5% | 46 | Instrument Serif |
| H2 (+ italic) | 52 / 1.0, −1% | 36 | Instrument Serif |
| H3 | 28 / 1.12, −0.5% | 24 | Instrument Serif |
| H4 | 22 / 1.15 | 22 | Instrument Serif |
| Lead | 18 / 1.5 | 18 | Instrument Sans 400 |
| Body | 16 / 1.55 | 16 | Instrument Sans 400 |
| Nav | 14 | — | Instrument Sans 500 |
| Button | 14 | 14 | Instrument Sans 600 |
| Price | 16 | 16 | Instrument Sans 600 |
| Label (eyebrow) | 12, UPPERCASE, +12% | 12 | Instrument Sans 500 |

## Layout
- **Desktop:** the page stretches. Each section has a container that fills the width up to **1280 px**, centred, with at least **64 px** side padding. Sections have **80 px** padding top and bottom. The design was checked at 1280 and 1440.
- **Mobile:** 390 px reference width. **20 px** side padding, **56 px** section padding (hero 32 top; footer 48 / 24). Everything stacks in one column.
- **Header:** fixed (sticky) on scroll.
  - Desktop: 114 px = a 35 px plum top bar with the address + the nav.
  - Mobile: 99 px = top bar + logo (150 px wide) + a round 40 px menu button.
  - In-page links must leave room for the header: use `scroll-margin-top: var(--header-h-desktop)` on sections (mobile: `--header-h-mobile`).
- Smooth scrolling for in-page links: about 0.6 s, ease-in-out. Respect `prefers-reduced-motion`.

## Components
| Component | Notes |
|---|---|
| **Button** | Pill shape. Primary: plum-500 fill, white text. Secondary: plum outline, plum text. Inverse: white fill on plum backgrounds. |
| **Text link** | Nav, footer, legal and contact variants. |
| **Icon link** | "Zwiń", "Wyczyść wyszukiwanie", and the arrow link on team cards. |
| **Service card** | "01 / 06" number, name, tagline, short treatment list, "od X zł", arrow. Default and Active (plum). 300 px tall on desktop; 3-column grid with 6 cards. |
| **Treatment row** | Treatment name, price pills (duration + price), "Zarezerwuj" button. The mobile version stacks name → pills → button. |
| **Price pill** | Duration + price. |
| **FAQ item** | Question + plus/minus toggle; the answer expands. Items open independently. |
| **Booking option** | A row in the reservation chooser: 44 px periwinkle-100 icon circle, title, hint (text-secondary), optional plum note, arrow ↗. The whole row is a link that opens in a new tab. Divider on top. |
| **Language switch** | Outlined pill with PL / EN / UA. Active option: plum-500 fill, white text. Label type style. |
| **Toggle** | Used in the cookie settings. |
| **Form field** | Label above the input. Text, select and textarea types. |
| **Team card** | Circular cut-out portrait on a plum gradient, name, "Zarezerwuj masaż z …" arrow link. 320 px wide. The team section has a plum-600 background. |
| **Filter chip** | Category chips in the empty search state. |

## Hover states
Smooth change, 150 ms ease-out. No hover styles on touch devices: use `@media (hover: hover)`.
- **Buttons:**
  - Primary: plum-500 → plum-600.
  - Secondary: gets a plum-100 fill.
  - Inverse: white → plum-100.
- **Text links:** underline, plus a colour change:
  - Nav and contact links → plum-500.
  - Footer links → periwinkle-200.
  - Legal links → white.
- **Icon links:** underline. "Zwiń" and "Wyczyść" → plum-600; the arrow link → white.
- **Booking option row:** plum-100 background.
- Not designed yet (use a light, consistent treatment): close buttons, the Contact "Instagram" block, the map, inline links, service cards, FAQ items, filter chips, the language switch.

## Pop-ups (overlays)
- **Desktop:** centred card with a dim behind it. Close button top right. The heading has a plum italic second word. Widths:
  - reservation chooser 440
  - cookie settings 440
  - cookie banner 400 (bottom left, no dim)
  - privacy policy 720×760 (scrolls inside)
  - gift voucher form about 750 tall
- **Mobile:**
  - Reservation chooser and cookie settings: bottom sheets with rounded top corners (24 px radius) and a dim.
  - Cookie banner: a card 12 px from the edges, with stacked full-width buttons.
  - Gift voucher form, success screen, privacy policy and menu: full screen.
- Fade in and out over 0.2 s.
