# Massage Heaven — website

Website for **Massage Heaven**, a massage studio at ul. Krucza 16/22, Warsaw. The designer builds the public website with Claude Code. A developer then polishes it, builds the server side and deploys.

- **Stack:** Astro, static output. Plain CSS with custom properties: no Tailwind and no UI kit, unless the developer decides otherwise.
- **Design source:** Figma file `J7HQH69jG2BbPrzjCWG5dx` ("Massage Heaven"), https://www.figma.com/design/J7HQH69jG2BbPrzjCWG5dx/Massage-Heaven
- **Languages:** PL (default, at `/`), EN (`/en/`), UA (`/ua/`). All three exist (Polish is the base; EN/UA files hold only translated text). See `docs/content/translations.md`.

## Where things are
| What | File |
|---|---|
| Colours, type, spacing (CSS variables) | `docs/design/tokens.css` |
| Layout rules, type scale, components, hover states | `docs/design/design-system.md` |
| Figma node ids for every section, overlay and component | `docs/design/figma-map.md` |
| Screens added to Figma after the code (node ids), and anything still to draw | `docs/design/figma-todo.md` |
| How the website behaves (booking chooser, services, FAQ, gift form, cookies, links) | `docs/behaviour/website.md` |
| Admin panel and gift voucher PDF (developer's part) | `docs/behaviour/admin-and-vouchers.md` |
| All Polish copy and data | `docs/content/*.json`, `docs/content/privacy-policy.pl.md` |
| How to add EN/UA translations | `docs/content/translations.md` |
| Handoff to the developer (start here for phase 2) | `docs/handoff.md` |
| Decisions, and what's still open | `docs/open-questions.md` |
| Results of the final checks (Lighthouse, keyboard, widths, Figma) | `docs/quality-checks.md` |

## Rules
- **Figma is the source of truth for the look; `docs/content/` is the source of truth for text and prices.** When they disagree, follow `docs/content/` and add the mismatch to `docs/open-questions.md`.
- Read the Figma node with the Figma MCP (`get_design_context`, `get_screenshot`) before building or changing a section. Node ids are in `docs/design/figma-map.md`. After building, compare a screenshot of the page with the Figma screenshot of the same node.
- Use the CSS variables from `tokens.css` (semantic ones first, like `--text-primary` and `--bg-highlight`). Never hard-code hex values in components.
- Fonts: Instrument Serif (Regular + Italic) and Instrument Sans (400/500/600); on the Ukrainian pages Playfair Display (Regular + Italic) and Onest (400/500/600), because Instrument has no Cyrillic. Self-host them from `@fontsource`. Do not load them from Google Fonts: the site needs no third-party requests before cookie consent.
- Keep all copy in content files (`src/content/` or `src/data/`), never hard-coded in components. The admin panel will edit these later, so every service, FAQ item, team member and contact detail must come from data.
- Mobile first. Breakpoints: mobile layout below 768 px, desktop layout from 1024 px. Between those two, stack the mobile layout inside a wider container. The desktop container is max 1280 px wide with at least 64 px of side padding; mobile has 20 px side padding.
- Accessibility: real `<button>` and `<a>` elements, visible focus styles, `aria-expanded` on FAQ items and category cards, focus trapped in pop-ups, Esc closes pop-ups, and every image has alt text.
- Third-party content (Google Map, analytics) loads **only after cookie consent**. See `docs/behaviour/website.md`.
- Spelling of names: **Anastazja** and **Ina**, with Polish declension (z Anastazją / z Iną, u Anastazji / u Iny). In Ukrainian: **Анастасія** and **Іна** (з Анастасією / з Іною, до Анастасії / до Іни). The legal name "Anastasiia Zhelezniak" appears only in the privacy policy, in Latin letters in every language.

## Scope split
**Designer + Claude Code (this repo, phase 1):** the full public one-page site, desktop and mobile:
- header with the language switch
- hero
- services (6 categories, panels that open, search)
- about
- FAQ
- gift voucher section and form pop-up
- team
- contact and map
- footer
- privacy policy pop-up
- cookie banner and settings
- reservation chooser pop-ups
- the PL/EN/UA routing

The voucher form only validates and shows the success screen. It doesn't send anything yet.

**Admin panel UI prototype (done 2026-11-13):** `src/admin/`, at `/admin` on the dev server only. Sample data, saved in the browser. See `docs/behaviour/admin-and-vouchers.md`.

**Developer (phase 2):**
- form submission and storage
- admin panel (login, vouchers, editing prices/FAQ/team/studio)
- voucher PDF generator
- analytics, if any
- hosting, domain and deploy

## Build order
1. Astro project, `tokens.css`, fonts, base styles, layout (Header and Footer).
2. Components: Button, TextLink, ServiceCard, TreatmentRow, PricePill, FaqItem, BookingOption, LanguageSwitch, Toggle, FormField, TeamCard, Modal/Sheet.
3. Homepage sections, top to bottom, desktop and mobile together.
4. Pop-ups: reservation chooser (general + per therapist), gift voucher form + success, privacy policy, cookie banner + settings, mobile menu.
5. i18n routes (`/en/`, `/ua/`) using the same content structure.
6. Check: Lighthouse, keyboard navigation, 390 / 768 / 1280 / 1440 widths, and a visual comparison with Figma.
