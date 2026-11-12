/**
 * Content loader. docs/content/ is the single source of truth for copy and prices;
 * components read it only through getContent().
 *
 * Polish is the base: site.json, services.json, faq.json, team.json, src/data/ui.pl.json.
 * A translation is an optional file next to it with the locale in the name
 * (site.en.json, faq.ua.json, src/data/ui.en.json …). It only needs the text it
 * translates, in the same shape: anything left out (prices, links, untranslated
 * strings) comes from Polish. Arrays merge item by item, so services.en.json can
 * translate category names without repeating the prices.
 * See docs/content/translations.md.
 */
import type { default as SiteJson } from '../../docs/content/site.json';
import type { default as ServicesJson } from '../../docs/content/services.json';
import type { default as FaqJson } from '../../docs/content/faq.json';
import type { default as TeamJson } from '../../docs/content/team.json';
import type { default as UiJson } from './ui.pl.json';

export const locales = ['pl', 'en', 'ua'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pl';

/** Value for <html lang> and hreflang. Ukrainian is "uk"; the URL segment is "ua". */
export const htmlLang: Record<Locale, string> = { pl: 'pl', en: 'en', ua: 'uk' };
export const ogLocale: Record<Locale, string> = { pl: 'pl_PL', en: 'en_GB', ua: 'uk_UA' };
export const localePath: Record<Locale, string> = { pl: '/', en: '/en/', ua: '/ua/' };

const contentFiles = import.meta.glob<Record<string, unknown>>('../../docs/content/*.json', {
  eager: true,
  import: 'default',
});
const uiFiles = import.meta.glob<Record<string, unknown>>('./ui.*.json', { eager: true, import: 'default' });

type Json = unknown;
const isObject = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Translation over base: objects by key, arrays by index; "_note"-style keys are ignored. */
export function merge<T>(base: T, override: Json): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) && Array.isArray(override)) {
    return base.map((item, i) => merge(item, override[i])) as T;
  }
  if (isObject(base) && isObject(override)) {
    const out: Record<string, Json> = { ...base };
    for (const [key, value] of Object.entries(override)) {
      if (key.startsWith('_')) continue;
      out[key] = key in base ? merge(base[key], value) : value;
    }
    return out as T;
  }
  return (typeof override === typeof base ? override : base) as T;
}

const contentFile = (name: string, locale?: Locale) =>
  contentFiles[`../../docs/content/${name}${locale ? `.${locale}` : ''}.json`];

const base = {
  site: contentFile('site') as typeof SiteJson,
  services: contentFile('services') as typeof ServicesJson,
  faq: contentFile('faq') as typeof FaqJson,
  team: contentFile('team') as typeof TeamJson,
  ui: uiFiles['./ui.pl.json'] as typeof UiJson,
};

export type Content = typeof base & {
  /** Locale of the URL. */
  locale: Locale;
  /** Language the visible text is actually in: the locale, or "pl" while untranslated. */
  contentLocale: Locale;
};

/** A locale counts as translated once it has its own site.<locale>.json. */
export const isTranslated = (locale: Locale): boolean => locale === defaultLocale || Boolean(contentFile('site', locale));

const cache = new Map<Locale, Content>();

export function getContent(locale: Locale): Content {
  const cached = cache.get(locale);
  if (cached) return cached;
  const content: Content =
    locale === defaultLocale
      ? { ...base, locale, contentLocale: locale }
      : {
          site: merge(base.site, contentFile('site', locale)),
          services: merge(base.services, contentFile('services', locale)),
          faq: merge(base.faq, contentFile('faq', locale)),
          team: merge(base.team, contentFile('team', locale)),
          ui: merge(base.ui, uiFiles[`./ui.${locale}.json`]),
          locale,
          contentLocale: isTranslated(locale) ? locale : defaultLocale,
        };
  cache.set(locale, content);
  return content;
}
