/**
 * LocalBusiness JSON-LD for the homepage (docs/behaviour/website.md → SEO basics).
 * Built only from content data, so the admin panel's edits (hours, phone, links)
 * flow into it once the site reads admin data (phase 2).
 */
import type { Content } from './index';

const DAYS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
} as const;

/** "8:30–21:00" → ["08:30", "21:00"]; anything else (e.g. closed) → null. */
function parseRange(value: string): [string, string] | null {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const pad = (h: string) => h.padStart(2, '0');
  return [`${pad(match[1])}:${match[2]}`, `${pad(match[3])}:${match[4]}`];
}

/** One entry per distinct opening time, listing the days that share it. */
function openingHours(hours: Record<string, string>) {
  const byRange = new Map<string, { dayOfWeek: string[]; opens: string; closes: string }>();
  for (const [key, day] of Object.entries(DAYS)) {
    const range = hours[key] ? parseRange(hours[key]) : null;
    if (!range) continue;
    const id = range.join('-');
    const entry = byRange.get(id) ?? { dayOfWeek: [], opens: range[0], closes: range[1] };
    entry.dayOfWeek.push(day);
    byRange.set(id, entry);
  }
  return [...byRange.values()].map((e) => ({ '@type': 'OpeningHoursSpecification', ...e }));
}

/** Map pin coordinates, read from the Google Maps embed URL (!2d<lng>!3d<lat>). */
function geo(embedUrl: string) {
  const match = embedUrl.match(/!2d(-?[\d.]+)!3d(-?[\d.]+)/);
  return match ? { '@type': 'GeoCoordinates', latitude: Number(match[2]), longitude: Number(match[1]) } : undefined;
}

export function localBusiness(content: Content, pageUrl: URL, site: URL) {
  const { studio, booking, hero } = content.site;
  const general = booking.general.groups.flatMap((g) => g.options);
  const channel = (id: string) => general.find((o) => o.id === id)?.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    '@id': new URL('/#business', site).href,
    name: studio.name,
    description: hero.lead,
    url: pageUrl.href,
    logo: new URL('/apple-touch-icon.png', site).href,
    image: new URL('/apple-touch-icon.png', site).href,
    telephone: studio.phone.replace(/\s/g, ''),
    email: studio.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `ul. ${studio.address}`,
      postalCode: studio.postcode,
      addressLocality: studio.city,
      addressCountry: 'PL',
    },
    geo: geo(studio.googleMapsEmbed),
    hasMap: studio.googleMaps,
    openingHoursSpecification: openingHours(studio.hours as Record<string, string>),
    sameAs: [studio.instagramProfile, channel('booksy'), channel('fresha')].filter(Boolean),
  };
}
