/**
 * Gift voucher layout, shared by the on-screen preview and the PDF generator.
 * Measured from Figma "Printables": front 520:83, back 520:82.
 *
 * Units are Figma pixels on the 1276 × 621 artboard = 216 × 105 mm
 * (210 × 99 mm trim + 3 mm bleed on every side). RGB only — no CMYK conversion.
 *
 * Colours are the brand primitives from tokens.css. They're repeated here as hex
 * because pdf-lib can't read CSS variables.
 */
export const ART = { width: 1276, height: 621 };
export const MM = { width: 216, height: 105, bleed: 3 };
export const PX_PER_MM = ART.width / MM.width; // ≈ 5.907
export const BLEED_PX = MM.bleed * PX_PER_MM; // ≈ 17.7

export const COLORS = {
  plum: '#832F66', // --plum-500
  periwinkle200: '#D0D4F4', // --periwinkle-200
  periwinkle300: '#A1AAE9', // --periwinkle-300
  ink: '#232327', // --neutral-700
  secondary: '#63646C', // --neutral-500
  white: '#FFFFFF',
};

export type FontKey = 'serif' | 'serifItalic' | 'sans' | 'sansMedium' | 'sansSemibold';

/** One line of text: top of its line box, font, size, line height (px), letter spacing (em). */
export type TextSpec = { x: number; y: number; font: FontKey; size: number; lineHeight: number; tracking?: number; color: string; upper?: boolean; width?: number; align?: 'left' | 'right' };

export const FRONT = {
  background: COLORS.plum,
  halo: { x: 868, y: 45, w: 259, h: 39.71, stroke: 4.32, color: COLORS.periwinkle300 },
  arch: { x: 798, y: 100, w: 400, h: 521, radius: 200 },
  logo: { x: 88, y: 109, w: 305.31, h: 56 },
  titlePl: { text: 'Bon podarunkowy', x: 88, y: 229.25, font: 'serif', size: 100, lineHeight: 95, tracking: -0.01, color: COLORS.white } as TextSpec & { text: string },
  titleEn: { text: 'Gift certificate', x: 88, y: 330.25, font: 'serifItalic', size: 64, lineHeight: 64, color: COLORS.periwinkle200 } as TextSpec & { text: string },
  tagline: { text: 'Chwila tylko dla Ciebie · A moment just for you', x: 88, y: 422.25, font: 'sans', size: 20, lineHeight: 27, color: COLORS.periwinkle200 } as TextSpec & { text: string },
  divider: { x: 88, y: 513.5, w: 650, h: 1.5, color: COLORS.periwinkle300 },
  address: { text: 'Warszawa · Krucza 16/22', x: 88, y: 531, font: 'sansMedium', size: 15, lineHeight: 18, tracking: 0.1, upper: true, color: COLORS.white } as TextSpec & { text: string },
  website: { text: 'massageheavenwarsaw.com', x: 738, y: 531, font: 'sansMedium', size: 15, lineHeight: 18, tracking: 0.1, upper: true, align: 'right', color: COLORS.white } as TextSpec & { text: string },
};

export type SlotKey = 'recipient' | 'buyer' | 'service' | 'validUntil' | 'code';

/** The five value slots on the back. Label at y, value line box at y + 21, rule at y + 61. */
export const SLOTS: { key: SlotKey; label: string; x: number; y: number; width: number }[] = [
  { key: 'recipient', label: 'Dla / For', x: 88, y: 170.5, width: 657 },
  { key: 'buyer', label: 'Od / From', x: 88, y: 269.67, width: 657 },
  { key: 'service', label: 'Usługa lub kwota / Service or amount', x: 88, y: 368.83, width: 657 },
  { key: 'validUntil', label: 'Ważny do / Valid until', x: 88, y: 468, width: 308.5 },
  { key: 'code', label: 'Nr / No.', x: 436.5, y: 468, width: 308.5 },
];
export const SLOT = {
  label: { font: 'sansMedium' as FontKey, size: 14, lineHeight: 17, tracking: 0.1, color: COLORS.ink },
  value: { font: 'serifItalic' as FontKey, dy: 21, max: 30, min: 22, lineHeight: 36, color: COLORS.plum },
  rule: { dy: 61, h: 1.5, color: COLORS.plum },
};

export const BACK = {
  background: COLORS.periwinkle200,
  heading: { x: 88, y: 90.5, size: 44, lineHeight: 44, color: COLORS.plum, regular: 'Bon podarunkowy ', italic: '/ Gift certificate' },
  divider: { x: 801, y: 86.5, w: 1, h: 448, color: COLORS.plum },
  icon: { x: 858, y: 90.5, d: 72, color: COLORS.plum, sign: { dx: 20.1, dy: 17.64, w: 31.8, h: 36.73, color: COLORS.white } },
  terms: [
    {
      // Line breaks as in Figma (the terms are static).
      text: 'Bon można zrealizować w Massage Heaven, ul.\nKrucza 16/22, Warszawa. Umów wizytę przez\nBooksy, Fresha, WhatsApp lub Instagram i podaj\nnumer bonu. Bon nie podlega wymianie na\ngotówkę.',
      x: 858, y: 264.5, width: 330, font: 'sans', size: 15, lineHeight: 21.75, color: COLORS.ink,
    },
    {
      text: 'Redeemable at Massage Heaven, Krucza 16/22,\nWarsaw. Book via Booksy, Fresha, WhatsApp or\nInstagram and quote the certificate number.\nNot exchangeable for cash.',
      x: 858, y: 386.5, width: 330, font: 'sans', size: 15, lineHeight: 21.75, color: COLORS.secondary,
    },
    { text: 'massageheavenwarsaw.com\nWhatsApp +48 731 711 509', x: 858, y: 486.5, width: 330, font: 'sansSemibold', size: 15, lineHeight: 21.75, color: COLORS.plum },
  ] as (TextSpec & { text: string; width: number })[],
};

export type VoucherValues = Record<SlotKey, string>;

/**
 * Value style rule: one line only. Start at 30 px and shrink 1 px at a time down to 22 px.
 * Never wrap; truncate with "…" only as a last resort.
 */
export function fitValue(text: string, maxWidth: number, measure: (text: string, size: number) => number): { text: string; size: number } {
  for (let size = SLOT.value.max; size >= SLOT.value.min; size--) {
    if (measure(text, size) <= maxWidth) return { text, size };
  }
  let t = text;
  while (t.length > 1 && measure(`${t}…`, SLOT.value.min) > maxWidth) t = t.slice(0, -1);
  return { text: `${t.trimEnd()}…`, size: SLOT.value.min };
}
