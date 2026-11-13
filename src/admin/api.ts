/**
 * The admin panel talks to its data only through `api` (bottom of this file).
 *
 * PHASE 1 (now): a prototype. `mockApi` starts from the real website content in
 * docs/content/*.json plus a few sample vouchers, and saves every change in this
 * browser's localStorage. Nothing reaches the website or a server.
 *
 * PHASE 2 (developer): implement `AdminApi` against the real back end (auth, database,
 * file storage for photos and voucher PDFs) and export it as `api`. The screens don't
 * need to change. The shapes are in types.ts.
 */
import servicesPl from '../../docs/content/services.json';
import servicesEn from '../../docs/content/services.en.json';
import servicesUa from '../../docs/content/services.ua.json';
import teamPl from '../../docs/content/team.json';
import teamEn from '../../docs/content/team.en.json';
import teamUa from '../../docs/content/team.ua.json';
import faqPl from '../../docs/content/faq.json';
import faqEn from '../../docs/content/faq.en.json';
import faqUa from '../../docs/content/faq.ua.json';
import sitePl from '../../docs/content/site.json';
import siteEn from '../../docs/content/site.en.json';
import siteUa from '../../docs/content/site.ua.json';
import { isStoredPhoto } from './team-photos';
import type {
  AdminData,
  Category,
  Channel,
  DayKey,
  FaqItem,
  Hours,
  Localized,
  Person,
  Studio,
  Voucher,
} from './types';

export interface AdminApi {
  // Auth
  session(): Promise<{ name: string; role: string } | null>;
  login(email: string, password: string, remember: boolean): Promise<boolean>;
  logout(): Promise<void>;
  /** Sends a reset link valid for 1 hour. */
  requestPasswordReset(email: string): Promise<void>;

  // Content
  load(): Promise<AdminData>;
  saveVoucher(v: Voucher): Promise<void>;
  saveCategories(c: Category[]): Promise<void>;
  saveTeam(t: Person[]): Promise<void>;
  saveFaq(f: FaqItem[]): Promise<void>;
  saveStudio(s: Studio): Promise<void>;

  /**
   * Stores the voucher PDF at a hard-to-guess public URL that works until the voucher
   * expires (e.g. massageheavenwarsaw.com/bon/7q4k-x8f2m).
   * Prototype: stores nothing and returns the address the real link will have; it
   * won't open until the developer builds it.
   */
  publishVoucherPdf(v: Voucher, pdf: Uint8Array): Promise<string>;
}

// ── Seed: the website's own content ───────────────────────

type J = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const loc = (pl: string, en?: string, ua?: string): Localized => ({ pl, ...(en ? { en } : {}), ...(ua ? { ua } : {}) });

function seedCategories(): Category[] {
  const en = servicesEn as J;
  const ua = servicesUa as J;
  return (servicesPl as J).categories.map((c: J, ci: number): Category => {
    const ce = en.categories?.[ci] ?? {};
    const cu = ua.categories?.[ci] ?? {};
    return {
      id: c.id,
      number: c.number,
      name: loc(c.name, ce.name, cu.name),
      tagline: loc(c.tagline, ce.tagline, cu.tagline),
      treatments: c.treatments.map((t: J, ti: number) => {
        const te = ce.treatments?.[ti] ?? {};
        const tu = cu.treatments?.[ti] ?? {};
        return {
          id: `${c.id}-${ti + 1}`,
          name: loc(t.name, te.name, tu.name),
          options: t.options.map((o: J, oi: number) => ({
            duration: loc(o.duration, te.options?.[oi]?.duration, tu.options?.[oi]?.duration),
            price: o.price,
          })),
          visible: true,
        };
      }),
    };
  });
}

function seedTeam(): Person[] {
  const therapists = (sitePl as J).booking.therapists;
  const byId = (file: J, id: string) => (file.people ?? []).find((p: J) => p.id === id) ?? {};
  const whatsappText = (url: string) => decodeURIComponent(new URL(url).searchParams.get('text') ?? '');
  return (teamPl as J).people.map((p: J): Person => {
    const e = byId(teamEn, p.id);
    const u = byId(teamUa, p.id);
    const links = therapists[p.chooser] ?? {};
    return {
      id: p.id,
      name: loc(p.name, e.name, u.name),
      role: loc(p.role, e.role, u.role),
      bio: loc(p.bio.join('\n\n'), e.bio?.join('\n\n'), u.bio?.join('\n\n')),
      visible: true,
      booksy: links.booksy ?? '',
      fresha: links.fresha ?? '',
      whatsappText: loc(links.whatsapp ? whatsappText(links.whatsapp) : ''),
      updatedAt: '2026-11-11T10:00:00',
    };
  });
}

function seedFaq(): FaqItem[] {
  return (faqPl as J).items.map((it: J, i: number) => ({
    id: `faq-${i + 1}`,
    q: loc(it.q, (faqEn as J).items?.[i]?.q, (faqUa as J).items?.[i]?.q),
    a: loc(it.a, (faqEn as J).items?.[i]?.a, (faqUa as J).items?.[i]?.a),
    visible: true,
  }));
}

function seedStudio(): Studio {
  const s = (sitePl as J).studio;
  const days: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const hours = Object.fromEntries(
    days.map((d) => {
      const [open, close] = String(s.hours[d]).split('–');
      return [d, { open, close, isOpen: true }];
    }),
  ) as Hours;
  const groups = (sitePl as J).booking.general.groups as J[];
  const groupsEn = (siteEn as J).booking?.general?.groups ?? [];
  const groupsUa = (siteUa as J).booking?.general?.groups ?? [];
  const channels: Channel[] = groups.flatMap((g, gi) =>
    g.options.map((o: J, oi: number) => ({
      id: o.id,
      title: loc(o.title, groupsEn[gi]?.options?.[oi]?.title, groupsUa[gi]?.options?.[oi]?.title),
      hint: loc(o.hint, groupsEn[gi]?.options?.[oi]?.hint, groupsUa[gi]?.options?.[oi]?.hint),
      url: o.id === 'instagram' ? s.instagramProfile : o.url,
      group: gi === 0 ? 'online' : 'message',
      visible: true,
    })),
  );
  return {
    address: `ul. ${s.addressTopBar}`,
    postcode: `${s.postcode} ${s.city}`,
    phone: s.phone,
    instagram: s.instagramHandle,
    googleMaps: s.googleMaps,
    hours,
    announcement: { text: loc('24 i 25 grudnia gabinet nieczynny · Wesołych Świąt!'), until: '2026-12-26', enabled: false },
    channels,
  };
}

/** Sample voucher requests (the ones drawn in Figma, plus a few older ones). */
function seedVouchers(): Voucher[] {
  const v = (x: Partial<Voucher> & Pick<Voucher, 'id' | 'createdAt' | 'buyer' | 'phone' | 'status' | 'value'>): Voucher => ({
    source: 'form',
    type: 'massage',
    history: [{ status: 'nowy', at: x.createdAt }],
    consentAt: x.source === 'manual' ? undefined : x.createdAt,
    ...x,
  });
  return [
    v({ id: 'v1', createdAt: '2026-11-12T09:14', buyer: 'Katarzyna Nowak', phone: '+48 600 123 456', status: 'nowy', treatment: 'Masaż relaksacyjny', duration: '60 min', value: 230, recipient: 'Mama' }),
    v({ id: 'v2', createdAt: '2026-11-11T21:40', buyer: 'Michał Zieliński', phone: '+48 512 908 331', status: 'nowy', type: 'amount', value: 300 }),
    v({
      id: 'v3', createdAt: '2026-11-10T18:02', buyer: 'Olena Kovalenko', phone: '+48 731 220 145', status: 'kontakt', treatment: 'Masaż Lomi Lomi', duration: '90 min', value: 340,
      history: [{ status: 'nowy', at: '2026-11-10T18:02' }, { status: 'kontakt', at: '2026-11-11T09:30' }],
    }),
    v({
      id: 'v4', createdAt: '2026-11-09T12:15', buyer: 'Anna Wiśniewska', phone: '+48 698 441 207', status: 'oplacony', treatment: 'Masaż gorącą świecą', duration: '60 min', value: 250,
      recipient: 'Kasia', message: 'Proszę o kontakt po 17:00.', code: 'MH-7Q4K', payment: 'BLIK', validUntil: '2027-05-09',
      note: 'Płatność BLIK 9.11. Odbiór osobisty w gabinecie w piątek po 17:00.',
      history: [{ status: 'nowy', at: '2026-11-09T12:15' }, { status: 'kontakt', at: '2026-11-09T14:02' }, { status: 'oplacony', at: '2026-11-09T14:10', detail: 'BLIK' }],
    }),
    v({
      id: 'v5', createdAt: '2026-11-07T16:48', buyer: 'Tomasz Lewandowski', phone: '+48 503 116 980', status: 'przekazany', type: 'amount', value: 500, code: 'MH-2N8D', payment: 'Przelew', validUntil: '2027-11-08', recipient: 'Ola',
      history: [{ status: 'nowy', at: '2026-11-07T16:48' }, { status: 'kontakt', at: '2026-11-07T18:10' }, { status: 'oplacony', at: '2026-11-08T10:00', detail: 'Przelew' }, { status: 'przekazany', at: '2026-11-08T10:20', detail: 'WhatsApp' }],
    }),
    v({
      id: 'v6', createdAt: '2026-11-02T10:20', buyer: 'Joanna Kamińska', phone: '+48 661 735 002', status: 'zrealizowany', treatment: 'Masaż Thai Mix', duration: '90 min', value: 340, code: 'MH-9F3A', payment: 'Gotówka', validUntil: '2027-11-02',
      history: [{ status: 'nowy', at: '2026-11-02T10:20' }, { status: 'kontakt', at: '2026-11-02T11:00' }, { status: 'oplacony', at: '2026-11-02T15:00', detail: 'Gotówka' }, { status: 'przekazany', at: '2026-11-02T15:05', detail: 'osobiście' }, { status: 'zrealizowany', at: '2026-11-10T18:00' }],
    }),
    v({
      id: 'v7', createdAt: '2026-10-21T11:05', buyer: 'Marta Dąbrowska', phone: '+48 604 778 912', status: 'przekazany', treatment: 'Masaż klasyczny', duration: '60 min', value: 230, code: 'MH-6T2W', payment: 'BLIK', validUntil: '2026-12-21', source: 'manual',
      history: [{ status: 'oplacony', at: '2026-10-21T11:05', detail: 'BLIK' }, { status: 'przekazany', at: '2026-10-21T11:06', detail: 'osobiście' }],
    }),
    v({
      id: 'v8', createdAt: '2026-10-14T19:30', buyer: 'Paweł Wójcik', phone: '+48 692 301 455', status: 'przekazany', type: 'amount', value: 250, code: 'MH-3K9R', payment: 'Przelew', validUntil: '2026-12-14',
      history: [{ status: 'nowy', at: '2026-10-14T19:30' }, { status: 'oplacony', at: '2026-10-15T09:00', detail: 'Przelew' }, { status: 'przekazany', at: '2026-10-15T09:10', detail: 'WhatsApp' }],
    }),
    v({
      id: 'v9', createdAt: '2025-11-20T14:05', buyer: 'Piotr Mazur', phone: '+48 790 554 318', status: 'przekazany', type: 'amount', value: 200, code: 'MH-4C1P', payment: 'Gotówka', validUntil: '2026-11-08', source: 'manual',
      history: [{ status: 'oplacony', at: '2025-11-20T14:05', detail: 'Gotówka' }, { status: 'przekazany', at: '2025-11-20T14:06', detail: 'osobiście' }],
    }),
  ];
}

export function seedData(): AdminData {
  return { vouchers: seedVouchers(), categories: seedCategories(), team: seedTeam(), faq: seedFaq(), studio: seedStudio() };
}

// ── Prototype implementation (localStorage) ───────────────

const DATA_KEY = 'mh-admin-data-v1';
const SESSION_KEY = 'mh-admin-session';
/** Prototype password, shown on the login screen's demo note. */
export const DEMO_PASSWORD = 'demo';

const store = {
  read(): AdminData | null {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      return raw ? (JSON.parse(raw) as AdminData) : null;
    } catch {
      return null;
    }
  },
  write(data: AdminData) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      // Quota (large photos) or private mode: keep working in memory.
    }
  },
};

let memory: AdminData | null = null;
const current = (): AdminData => (memory ??= migrate(store.read()) ?? seedData());

/** Fixes data saved by earlier prototype versions. */
function migrate(d: AdminData | null): AdminData | null {
  if (!d) return d;
  for (const p of d.team) if (!isStoredPhoto(p.photo)) delete p.photo;
  return d;
}
const update = async (fn: (d: AdminData) => void) => {
  const d = structuredClone(current());
  fn(d);
  memory = d;
  store.write(d);
  await new Promise((r) => setTimeout(r, 150));
};

const sessionStore = () => {
  try {
    return localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage;
  } catch {
    return null;
  }
};

export const mockApi: AdminApi = {
  async session() {
    const s = sessionStore();
    return s?.getItem(SESSION_KEY) ? { name: 'Anastazja', role: 'Właścicielka' } : null;
  },
  async login(email, password, remember) {
    await new Promise((r) => setTimeout(r, 300));
    if (!/^\S+@\S+\.\S+$/.test(email) || password !== DEMO_PASSWORD) return false;
    try {
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    return true;
  },
  async logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  },
  async requestPasswordReset() {
    await new Promise((r) => setTimeout(r, 300));
  },
  async load() {
    return structuredClone(current());
  },
  saveVoucher: (v) =>
    update((d) => {
      const i = d.vouchers.findIndex((x) => x.id === v.id);
      if (i >= 0) d.vouchers[i] = v;
      else d.vouchers.unshift(v);
    }),
  saveCategories: (c) => update((d) => void (d.categories = c)),
  saveTeam: (t) => update((d) => void (d.team = t)),
  saveFaq: (f) => update((d) => void (d.faq = f)),
  saveStudio: (s) => update((d) => void (d.studio = s)),
  async publishVoucherPdf(v) {
    const token = `${(v.code ?? 'mh').slice(3).toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`;
    return `${(sitePl as J).studio.website.replace('https://', '')}/bon/${token}`;
  },
};

/** Prototype only: forget local changes and start again from the website content. */
export function resetPrototypeData() {
  memory = null;
  try {
    localStorage.removeItem(DATA_KEY);
  } catch {
    /* ignore */
  }
}

export const api: AdminApi = mockApi;
