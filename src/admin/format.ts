/** Formatting and voucher rules shared by the admin screens. Polish only (the admin UI is Polish). */
import type { Localized, Locale, Voucher, VoucherStatus } from './types';

const MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const MONTHS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const MONTHS_LOC = ['styczniu', 'lutym', 'marcu', 'kwietniu', 'maju', 'czerwcu', 'lipcu', 'sierpniu', 'wrześniu', 'październiku', 'listopadzie', 'grudniu'];

const d = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00` : iso);
const pad = (n: number) => String(n).padStart(2, '0');

/** Today in the prototype. Real dates in phase 2. */
export const now = () => new Date();

/** "12 lis" this year, "20 lis 2025" otherwise. */
export const shortDate = (iso: string) => {
  const x = d(iso);
  return `${x.getDate()} ${MONTHS_SHORT[x.getMonth()]}${x.getFullYear() === now().getFullYear() ? '' : ` ${x.getFullYear()}`}`;
};
export const time = (iso: string) => {
  const x = d(iso);
  return `${pad(x.getHours())}:${pad(x.getMinutes())}`;
};
/** "9 lis, 12:15" */
export const shortDateTime = (iso: string) => `${shortDate(iso)}, ${time(iso)}`;
/** "9 lis 2026, 12:15" */
export const fullDateTime = (iso: string) => {
  const x = d(iso);
  return `${x.getDate()} ${MONTHS_SHORT[x.getMonth()]} ${x.getFullYear()}, ${time(iso)}`;
};
/** "9 maja 2027" */
export const longDate = (iso: string) => {
  const x = d(iso);
  return `${x.getDate()} ${MONTHS_GEN[x.getMonth()]} ${x.getFullYear()}`;
};
/** "26 gru 2026" */
export const mediumDate = (iso: string) => {
  const x = d(iso);
  return `${x.getDate()} ${MONTHS_SHORT[x.getMonth()]} ${x.getFullYear()}`;
};
/** "09.05.2027" — the voucher's "Ważny do" */
export const dotDate = (iso: string) => {
  const x = d(iso);
  return `${pad(x.getDate())}.${pad(x.getMonth() + 1)}.${x.getFullYear()}`;
};
export const monthLocative = (month: number) => MONTHS_LOC[month];
export const isoDate = (x: Date) => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
export const isoDateTime = (x: Date) => `${isoDate(x)}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
export const addMonths = (x: Date, months: number) => {
  const y = new Date(x);
  y.setMonth(y.getMonth() + months);
  return y;
};

export const zl = (n: number) => `${n.toLocaleString('pl-PL')} zł`;

/** Text in a language, falling back to Polish. */
export const t = (l: Localized | undefined, locale: Locale = 'pl') => (l ? (l[locale] ?? '').trim() || l.pl : '');
export const hasTranslation = (l: Localized | undefined, locale: Locale) => Boolean(l && (locale === 'pl' ? l.pl : l[locale]?.trim()));

// ── Vouchers ──────────────────────────────────────────────

export const STATUS_LABEL: Record<VoucherStatus, string> = {
  nowy: 'Nowy',
  kontakt: 'W kontakcie',
  oplacony: 'Opłacony',
  przekazany: 'Przekazany',
  zrealizowany: 'Zrealizowany',
  wygasly: 'Wygasły',
};
export const FLOW: Exclude<VoucherStatus, 'wygasly'>[] = ['nowy', 'kontakt', 'oplacony', 'przekazany', 'zrealizowany'];

/** Stored status, or "wygasly" once a paid voucher is past its date and not used. */
export function statusOf(v: Voucher): VoucherStatus {
  if ((v.status === 'oplacony' || v.status === 'przekazany') && v.validUntil && d(v.validUntil) < startOfToday()) return 'wygasly';
  return v.status;
}
const startOfToday = () => {
  const x = now();
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Paid, handed over or waiting, and still valid. */
export const isActive = (v: Voucher) => ['oplacony', 'przekazany'].includes(statusOf(v));

export const voucherTitle = (v: Voucher) => (v.type === 'amount' ? `Kwota: ${zl(v.value)}` : (v.treatment ?? ''));
export const voucherSubtitle = (v: Voucher) => (v.type === 'amount' ? 'dowolny zabieg' : (v.duration ?? ''));
/** "Masaż gorącą świecą · 60 min" or "300 zł" — also the PDF's "Usługa lub kwota". */
export const voucherService = (v: Voucher) => (v.type === 'amount' ? zl(v.value) : [v.treatment, v.duration].filter(Boolean).join(' · '));

/** MH-XXXX, without easily confused characters (0/O, 1/I). */
export function newCode(existing: string[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    const code = `MH-${Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
    if (!existing.includes(code)) return code;
  }
}

/** Polish dative-free display name for the dialog ("do Anny Wiśniewskiej") is hard to get right; use the name as written. */
export const firstName = (full: string) => full.split(' ')[0];

/**
 * WhatsApp text. Massage vouchers: from the design (Figma 464:4614).
 * Amount vouchers: wording chosen by the designer (2026-11-13), which also says how to use the voucher.
 */
export function whatsappMessage(v: Voucher, link: string): string {
  const until = v.validUntil ? longDate(v.validUntil) : '—';
  if (v.type === 'amount') {
    return [
      `Dzień dobry! Przesyłam bon podarunkowy Massage Heaven o wartości ${zl(v.value)}, do wykorzystania na dowolny zabieg z naszego cennika. Kod ${v.code}, ważny do ${until}.`,
      `Bon w PDF: ${link}`,
      'Przy rezerwacji wystarczy podać kod. Do zobaczenia na Kruczej 16/22!',
    ].join('\n');
  }
  const what = `${(v.treatment ?? '').replace(/^Masaż/, 'masaż')}, ${v.duration}`;
  return [
    `Dzień dobry! Przesyłam bon podarunkowy Massage Heaven: ${what}. Kod ${v.code}, ważny do ${until}.`,
    `Bon w PDF: ${link}`,
    'Do zobaczenia na Kruczej 16/22!',
  ].join('\n');
}

export const phoneDigits = (phone: string) => phone.replace(/[^\d]/g, '').replace(/^(?!48)(\d{9})$/, '48$1');
export const waLink = (phone: string, text: string) => `https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent(text)}`;
export const telLink = (phone: string) => `tel:+${phoneDigits(phone)}`;

/** "Masaż relaksacyjny" → "Relaksacyjny" for the category card list. */
export const shortTreatmentName = (name: string) => {
  const s = name.replace(/^Masaż (twarzy )?/, '').split(/ [–+(]/)[0];
  return s.charAt(0).toUpperCase() + s.slice(1);
};
