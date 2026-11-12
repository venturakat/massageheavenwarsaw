/**
 * Content loader. The JSON in docs/content/ is the single source of truth for
 * copy and prices; components read it only through getContent().
 *
 * Only Polish exists so far: EN and UA fall back to the Polish content until
 * translations arrive (add docs/content/*.en.json etc. and map them here).
 */
import site from '../../docs/content/site.json';
import services from '../../docs/content/services.json';
import faq from '../../docs/content/faq.json';
import team from '../../docs/content/team.json';
import uiPl from './ui.pl.json';

export const locales = ['pl', 'en', 'ua'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pl';

/** Value for <html lang> and hreflang. Ukrainian is "uk"; the URL segment is "ua". */
export const htmlLang: Record<Locale, string> = { pl: 'pl', en: 'en', ua: 'uk' };

export const localePath: Record<Locale, string> = { pl: '/', en: '/en/', ua: '/ua/' };

const byLocale = {
  pl: { site, services, faq, team, ui: uiPl },
  en: { site, services, faq, team, ui: uiPl },
  ua: { site, services, faq, team, ui: uiPl },
} satisfies Record<Locale, unknown>;

export type Content = (typeof byLocale)['pl'];

export function getContent(locale: Locale): Content {
  return byLocale[locale];
}
