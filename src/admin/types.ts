/**
 * Admin panel data model. The same shapes are what the developer's back end
 * should store and return (see api.ts → AdminApi).
 */
export type Locale = 'pl' | 'en' | 'ua';
export const LOCALES: Locale[] = ['pl', 'en', 'ua'];

/** Text in up to three languages. Polish is required; EN/UA fall back to Polish on the site. */
export type Localized = { pl: string; en?: string; ua?: string };

// ── Vouchers ──────────────────────────────────────────────

export type VoucherStatus = 'nowy' | 'kontakt' | 'oplacony' | 'przekazany' | 'zrealizowany' | 'wygasly';
export type Payment = 'BLIK' | 'Gotówka' | 'Przelew' | 'Karta';
export const PAYMENTS: Payment[] = ['BLIK', 'Gotówka', 'Przelew', 'Karta'];

export type HistoryEntry = {
  status: Exclude<VoucherStatus, 'wygasly'>;
  at: string; // ISO date-time
  detail?: string; // "BLIK", "WhatsApp" …
};

export type Voucher = {
  id: string;
  /** MH-XXXX. Given when the voucher is paid (or straight away for a manual voucher). */
  code?: string;
  createdAt: string;
  source: 'form' | 'manual';
  type: 'massage' | 'amount';
  treatment?: string; // Polish name from the price list
  duration?: string; // "60 min"
  value: number; // zł
  recipient?: string; // "Dla kogo"
  buyer: string;
  phone: string; // +48 …
  message?: string;
  consentAt?: string; // RODO consent from the website form
  /** Stored status; "wygasly" is never stored, it is calculated from validUntil. */
  status: Exclude<VoucherStatus, 'wygasly'>;
  payment?: Payment;
  validUntil?: string; // ISO date
  history: HistoryEntry[];
  note?: string;
};

// ── Price list ────────────────────────────────────────────

export type PriceOption = { duration: Localized; price: number };
export type Treatment = {
  id: string;
  name: Localized;
  description?: Localized;
  options: PriceOption[];
  visible: boolean;
};
export type Category = {
  id: string;
  number: string; // "01" … "06"
  name: Localized;
  tagline: Localized;
  treatments: Treatment[];
};

// ── Team ──────────────────────────────────────────────────

export type Person = {
  id: string;
  name: Localized;
  role: Localized;
  bio: Localized; // paragraphs separated by a blank line
  photo?: string; // URL or data: URL (prototype)
  visible: boolean;
  booksy: string;
  fresha: string;
  whatsappText: Localized;
  updatedAt?: string;
};

// ── FAQ ───────────────────────────────────────────────────

export type FaqItem = { id: string; q: Localized; a: Localized; visible: boolean };

// ── Studio & booking ──────────────────────────────────────

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Hours = Record<DayKey, { open: string; close: string; isOpen: boolean }>;

export type Channel = {
  id: 'booksy' | 'fresha' | 'whatsapp' | 'instagram';
  title: Localized;
  url: string;
  hint: Localized;
  group: 'online' | 'message';
  visible: boolean;
};

export type Studio = {
  address: string;
  postcode: string;
  phone: string;
  instagram: string;
  googleMaps: string;
  hours: Hours;
  announcement: { text: Localized; until: string; enabled: boolean };
  channels: Channel[];
};

// ── Site texts (Info i teksty) ────────────────────────────

/** A serif section title: two lines, the second one in italic (the line break is part of the design). */
export type TwoLines = [Localized, Localized];
export type Feature = { title: Localized; text: Localized };

/**
 * Headings and descriptions of the fixed homepage sections. The structure is fixed
 * (no adding or removing paragraphs or boxes); only the words change.
 * Button labels, form labels, menu and footer stay in src/data/ui.*.json.
 */
export type SiteTexts = {
  hero: { eyebrow: Localized; title: TwoLines; lead: Localized };
  /** `text`: paragraphs separated by a blank line, like a person's bio. */
  about: { eyebrow: Localized; title: TwoLines; text: Localized; features: [Feature, Feature, Feature] };
  gift: { eyebrow: Localized; title: TwoLines; text: Localized };
  contact: { eyebrow: Localized; title: TwoLines };
};

export type AdminData = {
  vouchers: Voucher[];
  categories: Category[];
  team: Person[];
  faq: FaqItem[];
  studio: Studio;
  texts: SiteTexts;
};
