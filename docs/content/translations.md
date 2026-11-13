# Adding a translation (EN / UA)

The site has three routes: `/` (Polish), `/en/` and `/ua/`. Polish is the base. Until a
language is translated, its route shows the Polish text.

## Files
Add a file next to the Polish one with the language in its name. You only need the
text you translate, in the same structure as the Polish file. Everything you leave
out (prices, links, phone numbers, untranslated strings) comes from Polish.

| Polish (base) | English | Ukrainian |
|---|---|---|
| `docs/content/site.json` | `site.en.json` | `site.ua.json` |
| `docs/content/services.json` | `services.en.json` | `services.ua.json` |
| `docs/content/faq.json` | `faq.en.json` | `faq.ua.json` |
| `docs/content/team.json` | `team.en.json` | `team.ua.json` |
| `docs/content/privacy-policy.pl.md` | `privacy-policy.en.md` | `privacy-policy.ua.md` |
| `src/data/ui.pl.json` | `src/data/ui.en.json` | `src/data/ui.ua.json` |

The code picks the files up automatically; nothing else needs changing.

## How the merge works
- **Objects** merge by key: translate `hero.lead` and keep everything else.
- **Lists** merge item by item, in the same order. To translate only the category names
  in `services.en.json`, give each category just its `name` (and `tagline`, `cardList`):
  ```json
  { "categories": [ { "name": "Classic and therapeutic massage", "tagline": "…" }, { "name": "…" } ] }
  ```
  Prices and durations stay as in Polish. Keep the order and count of items.
- Keys starting with `_` (notes) are ignored.
- The privacy policy is a whole document: translate the full file. Use `## ` for section
  headings, `- ` for bullet points, `[brackets]` for gaps still to fill in, and keep the
  "last updated" line starting with the text of `policyUpdatedPrefix` in that language's
  `ui` file.

## When a language counts as "translated"
As soon as `site.<lang>.json` exists. Then that route:
- sets `<html lang>` to its language (until then it says `pl`, because the text is Polish)
- is listed in the `hreflang` alternates and gets a canonical link
- loses the `noindex` tag that keeps the untranslated copy out of search results

So add `site.<lang>.json` last, or together with the rest, once the translation is complete.

## Ukrainian fonts
Instrument Serif and Instrument Sans have no Cyrillic letters, so `/ua/` uses Playfair Display
and Onest (Figma page «Landing cyrillic», 540:61). They are imported only by `src/pages/ua/index.astro`
(`src/styles/fonts-ua.css`) and switched on by `:root:lang(uk)` in `src/styles/base.css`, which
also holds the Ukrainian type sizes. The printed voucher card keeps the Instrument fonts.

## Plurals
Templates with forms like `{процедура|процедури|процедур}` list them as one | few | many.
The search uses the browser's plural rules for the page language, so Polish and Ukrainian
(which differ, e.g. 21) both come out right.
