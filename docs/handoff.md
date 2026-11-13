# Handoff to the developer (phase 2)

Written 2026-11-13, when the designer finished phase 1. Start here; everything else is linked.

## In one paragraph
The public website is finished: a one-page Astro site (static output), Polish at `/`, English at `/en/`, Ukrainian at `/ua/`, desktop and mobile, checked against Figma and Lighthouse. The client has confirmed the content, prices, hours and rules. Nothing is sent or stored yet: the gift voucher form only validates and shows its success screen. There is also a working **admin panel prototype** at `/admin` (dev server only) that keeps its data in the browser. Your job is the server side: storing voucher requests, a real admin back end, hosting the voucher PDFs, and deploying.

## Run it
```bash
npm install
npm run dev        # http://localhost:4321  (admin: /admin, password "demo")
npm run build      # public site only, into dist/
npm run preview
```
Built with Node 26. `ADMIN_PREVIEW=1 npm run build` also puts `/admin` in the build (for a preview, never for production).

## Where things are
| What | Where |
|---|---|
| Rules for working in this repo (stack, fonts, accessibility, content) | [`CLAUDE.md`](../CLAUDE.md) |
| How the website behaves | [`docs/behaviour/website.md`](behaviour/website.md) |
| Admin panel, voucher statuses, voucher PDF | [`docs/behaviour/admin-and-vouchers.md`](behaviour/admin-and-vouchers.md) |
| All copy, prices, team, FAQ (PL/EN/UA) | [`docs/content/`](content/) + `src/data/ui.*.json` |
| Design tokens, design system, Figma node ids | [`docs/design/`](design/) |
| Decisions and what's still open | [`docs/open-questions.md`](open-questions.md) |
| Lighthouse, keyboard, widths, Figma comparison | [`docs/quality-checks.md`](quality-checks.md) |

## What's done
- **Website:** header with PL/EN/UA switch, hero, services (6 categories, opening panels, search), about, FAQ, gift voucher section + form, team (with bios), contact + map, footer (with opening hours), 404 pages (`/404.html`, `/en/404.html`, `/ua/404.html`).
- **Pop-ups:** booking chooser (general + per therapist), gift voucher form + success, privacy policy, cookie banner + settings, mobile menu.
- **Privacy by default:** fonts are self-hosted; no third-party request before cookie consent. The Google Map iframe loads only after "Funkcjonalne" consent.
- **SEO:** titles, descriptions, canonical + hreflang, Open Graph image (`public/og-image.png`), LocalBusiness JSON-LD built from the content (`src/data/structured-data.ts`).
- **Admin prototype** (`src/admin/`, Preact): login, vouchers (list, detail, statuses, add/edit/delete, PDF, WhatsApp link), price list, team (photo crop + background removal), FAQ, "Info & teksty" (studio details, hours, booking channels, top-bar announcement, section texts). Desktop and mobile.
- **Voucher PDF:** `src/admin/pdf/voucher-pdf.ts` (pdf-lib) builds the final 2-page RGB PDF from the Figma layout. It runs in the browser today and can run in Node.

## What you build
1. **Voucher requests from the website.** Replace the body of `submitVoucherRequest()` in [`src/scripts/voucher.ts`](../src/scripts/voucher.ts): send the data, store it as a `Voucher` with status `nowy`, and throw on failure (the form then shows its error). Validate on the server too: phone, consent, and for amount vouchers at least the lowest price in the price list (no maximum).
2. **Admin back end.** Every admin screen goes through `AdminApi` in [`src/admin/api.ts`](../src/admin/api.ts); swap `mockApi` for real calls. Shapes are in `src/admin/types.ts`. Needed: auth (e-mail + password, "Zapamiętaj mnie", reset link valid 1 h), vouchers (`deleteVoucher` must refuse paid vouchers), price list, team (photo storage), FAQ, studio + texts, and `publishVoucherPdf()` (store the PDF at a hard-to-guess URL like `/bon/7q4k-x8f2m`, valid until the voucher expires).
3. **Site reads admin data.** "Zmiany widać na stronie od razu": the site has to read prices, team, FAQ, hours and texts from the admin data source, not only from `docs/content/`. Your choice: SSR, on-demand revalidation or a rebuild hook. The JSON-LD and the footer hours are built from the same data, so they follow automatically.
4. **Hosting and deploy.** Domain `massageheavenwarsaw.com` (already the `site` in `astro.config.mjs`). Serve the matching 404 per language (`/en/*` → `/en/404.html`, `/ua/*` → `/ua/404.html`, else `/404.html`); examples in `website.md`. Keep `/admin` out of the public build unless it's behind real auth.
5. **Background removal files.** The admin's "Usuń tło" downloads a model from huggingface.co and the ONNX runtime from cdn.jsdelivr.net on first use. Self-host both before launch (see the comment in `src/admin/bg-removal.ts`).
6. **Privacy policy.** Update the three policies (`docs/content/privacy-policy.*.md`): publication date, analytics tool (or none), 12-month retention for unanswered voucher requests.
7. **Analytics (optional).** None chosen. If one is added, start it from the `mh:consent` event (`src/scripts/consent.ts`), only with consent.

Not needed (decided): moving the pop-up copy into the content files, and a smaller font subset for the Ukrainian page.

## Rules the client confirmed
- Amount vouchers: at least the lowest price in the price list (now 80 zł), no maximum. Every voucher is valid for 12 months. Code format `MH-XXXX`.
- Statuses: Nowy → W kontakcie → Opłacony → Przekazany → Zrealizowany (+ Wygasły). Only unpaid vouchers can be edited or deleted.
- Exactly 6 service categories (rename only). Booking stays in Booksy / Fresha / WhatsApp / Instagram: no calendar, no client database.
- Opening hours, cancellation notice (24 h), the Polish Fresha links: confirmed 2026-11-13.

## Still open
- **Figma** is behind the code in a few places (admin dialogs, 404 page, footer hours, team with bios). The designer will draw them when the Figma connector works again: [`docs/design/figma-todo.md`](design/figma-todo.md). The code is the reference until then.
- Contact: the designer (repo owner). The studio owner is Anastazja (client e-mail in `site.json` → `studio.email`).
