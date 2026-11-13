/**
 * Gift voucher PDF: 2 pages (front, back), 216 × 105 mm each (trim 210 × 99 + 3 mm bleed),
 * RGB, fonts embedded (Instrument Serif / Sans, OFL — see fonts/), no crop marks.
 * One file for print and for WhatsApp.
 *
 * Runs in the browser (prototype) and works in Node too, so the developer can move it
 * to the server in phase 2: pass `loadAsset` that reads files from disk instead of fetch.
 */
import { PDFDocument, rgb, popGraphicsState, pushGraphicsState, moveTo, lineTo, appendBezierCurve, closePath, clip, endPath, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ART, BACK, FRONT, MM, SLOT, SLOTS, fitValue, type FontKey, type TextSpec, type VoucherValues } from './voucher-layout';
import serifUrl from './fonts/InstrumentSerif-Regular.ttf?url';
import serifItalicUrl from './fonts/InstrumentSerif-Italic.ttf?url';
import sansUrl from './fonts/InstrumentSans-Regular.ttf?url';
import sansMediumUrl from './fonts/InstrumentSans-Medium.ttf?url';
import sansSemiboldUrl from './fonts/InstrumentSans-SemiBold.ttf?url';
import archUrl from './arch.jpg?url';
import logoSvg from '../../assets/brand/logo-white.svg?raw';
import signSvg from '../../assets/brand/sign-white.svg?raw';

const PT_PER_MM = 72 / 25.4;
const PAGE = { w: MM.width * PT_PER_MM, h: MM.height * PT_PER_MM };
const K = PAGE.w / ART.width; // pt per Figma px

const fetchBytes = async (url: string) => new Uint8Array(await (await fetch(url)).arrayBuffer());

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
/** Figma top-left px → PDF bottom-left pt. */
const X = (px: number) => px * K;
const Y = (px: number) => PAGE.h - px * K;

/** Path data and viewBox width of a single-path SVG (the brand logo files). */
function svgPath(svg: string) {
  const d = svg.match(/ d="([^"]+)"/)?.[1] ?? '';
  const vbWidth = Number(svg.match(/viewBox="0 0 ([\d.]+)/)?.[1] ?? 1);
  return { d, vbWidth };
}

type Fonts = Record<FontKey, PDFFont>;

/** Baseline for a line box of height `lineHeight` (px) starting at `top` (px), the way Figma centres text. */
function baseline(font: PDFFont, size: number, top: number, lineHeight: number) {
  // Sizes are in Figma px, so these heights are px too.
  const full = font.heightAtSize(size); // ascent + descent
  const ascent = font.heightAtSize(size, { descender: false });
  return top + (lineHeight - full) / 2 + ascent;
}

function widthPx(font: PDFFont, text: string, size: number, tracking = 0) {
  return font.widthOfTextAtSize(text, size) + tracking * size * Math.max(text.length - 1, 0);
}

function drawLine(page: PDFPage, fonts: Fonts, text: string, spec: TextSpec, top = spec.y, sizeOverride?: number) {
  const font = fonts[spec.font];
  const size = sizeOverride ?? spec.size;
  const t = spec.upper ? text.toUpperCase() : text;
  const tracking = spec.tracking ?? 0;
  const w = widthPx(font, t, size, tracking);
  const x = spec.align === 'right' ? spec.x - w : spec.x;
  const y = baseline(font, size, top, spec.lineHeight);
  if (!tracking) {
    page.drawText(t, { x: X(x), y: Y(y), size: size * K, font, color: hex(spec.color) });
    return;
  }
  // Letter spacing: draw glyph by glyph.
  let cx = x;
  for (const ch of t) {
    page.drawText(ch, { x: X(cx), y: Y(y), size: size * K, font, color: hex(spec.color) });
    cx += font.widthOfTextAtSize(ch, size) + tracking * size;
  }
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  return text.split('\n').flatMap((para) => {
    const lines: string[] = [];
    let line = '';
    for (const word of para.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      // pdf-lib measures without kerning (a little wider than Figma), so allow 3 %.
      if (line && font.widthOfTextAtSize(next, size) > maxWidth * 1.03) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
    return lines;
  });
}

function rect(page: PDFPage, r: { x: number; y: number; w: number; h: number; color: string }) {
  page.drawRectangle({ x: X(r.x), y: Y(r.y + r.h), width: r.w * K, height: r.h * K, color: hex(r.color) });
}

async function loadFonts(doc: PDFDocument): Promise<Fonts> {
  doc.registerFontkit(fontkit);
  const [serif, serifItalic, sans, sansMedium, sansSemibold] = await Promise.all(
    [serifUrl, serifItalicUrl, sansUrl, sansMediumUrl, sansSemiboldUrl].map(async (u) => doc.embedFont(await fetchBytes(u), { subset: true })),
  );
  return { serif, serifItalic, sans, sansMedium, sansSemibold };
}

function drawFront(doc: PDFDocument, fonts: Fonts, arch: Awaited<ReturnType<PDFDocument['embedJpg']>>) {
  const page = doc.addPage([PAGE.w, PAGE.h]);
  rect(page, { x: 0, y: 0, w: ART.width, h: ART.height, color: FRONT.background });

  // Halo
  const h = FRONT.halo;
  page.drawEllipse({ x: X(h.x + h.w / 2), y: Y(h.y + h.h / 2), xScale: (h.w / 2) * K, yScale: (h.h / 2) * K, borderColor: hex(h.color), borderWidth: h.stroke * K });

  // Photo in an arch: clip to a rectangle with a round top, then draw the image.
  const a = FRONT.arch;
  const c = 0.5523 * a.radius;
  const [x0, x1, yTop, yMid, yBot] = [X(a.x), X(a.x + a.w), Y(a.y), Y(a.y + a.radius), Y(a.y + a.h)];
  const cK = c * K;
  const cx = (x0 + x1) / 2;
  page.pushOperators(
    pushGraphicsState(),
    moveTo(x0, yBot),
    lineTo(x0, yMid),
    appendBezierCurve(x0, yMid + cK, cx - cK, yTop, cx, yTop),
    appendBezierCurve(cx + cK, yTop, x1, yMid + cK, x1, yMid),
    lineTo(x1, yBot),
    closePath(),
    clip(),
    endPath(),
  );
  page.drawImage(arch, { x: x0, y: yBot, width: x1 - x0, height: yTop - yBot });
  page.pushOperators(popGraphicsState());

  // Logo
  const logo = svgPath(logoSvg);
  page.drawSvgPath(logo.d, { x: X(FRONT.logo.x), y: Y(FRONT.logo.y), scale: (FRONT.logo.w / logo.vbWidth) * K, color: hex('#FFFFFF') });

  for (const spec of [FRONT.titlePl, FRONT.titleEn, FRONT.tagline, FRONT.address, FRONT.website]) drawLine(page, fonts, spec.text, spec);
  rect(page, FRONT.divider);
}

function drawBack(doc: PDFDocument, fonts: Fonts, values: VoucherValues) {
  const page = doc.addPage([PAGE.w, PAGE.h]);
  rect(page, { x: 0, y: 0, w: ART.width, h: ART.height, color: BACK.background });

  // Heading: "Bon podarunkowy " regular + "/ Gift certificate" italic
  const hd = BACK.heading;
  const base = baseline(fonts.serif, hd.size, hd.y, hd.lineHeight);
  page.drawText(hd.regular, { x: X(hd.x), y: Y(base), size: hd.size * K, font: fonts.serif, color: hex(hd.color) });
  const w = fonts.serif.widthOfTextAtSize(hd.regular, hd.size);
  page.drawText(hd.italic, { x: X(hd.x + w), y: Y(base), size: hd.size * K, font: fonts.serifItalic, color: hex(hd.color) });

  for (const slot of SLOTS) {
    drawLine(page, fonts, slot.label, { ...SLOT.label, x: slot.x, y: slot.y, upper: true });
    const value = values[slot.key]?.trim();
    if (value) {
      const font = fonts[SLOT.value.font];
      const fit = fitValue(value, slot.width, (t, s) => font.widthOfTextAtSize(t, s));
      drawLine(page, fonts, fit.text, { font: SLOT.value.font, x: slot.x, y: slot.y + SLOT.value.dy, size: fit.size, lineHeight: SLOT.value.lineHeight, color: SLOT.value.color }, undefined, fit.size);
    }
    rect(page, { x: slot.x, y: slot.y + SLOT.rule.dy, w: slot.width, h: SLOT.rule.h, color: SLOT.rule.color });
  }

  rect(page, BACK.divider);

  // Brand icon: plum circle with the white sign
  const ic = BACK.icon;
  page.drawCircle({ x: X(ic.x + ic.d / 2), y: Y(ic.y + ic.d / 2), size: (ic.d / 2) * K, color: hex(ic.color) });
  const sign = svgPath(signSvg);
  page.drawSvgPath(sign.d, { x: X(ic.x + ic.sign.dx), y: Y(ic.y + ic.sign.dy), scale: (ic.sign.w / sign.vbWidth) * K, color: hex(ic.sign.color) });

  for (const block of BACK.terms) {
    const font = fonts[block.font];
    wrap(font, block.text, block.size, block.width).forEach((line, i) => drawLine(page, fonts, line, block, block.y + i * block.lineHeight));
  }
}

/** Builds the voucher PDF. Leave `values` empty for the blank print template. */
export async function generateVoucherPdf(values: VoucherValues): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(values.code ? `Bon podarunkowy ${values.code} — Massage Heaven` : 'Bon podarunkowy — Massage Heaven');
  doc.setAuthor('Massage Heaven');
  doc.setCreator('Massage Heaven — panel gabinetu');
  const fonts = await loadFonts(doc);
  const arch = await doc.embedJpg(await fetchBytes(archUrl));
  drawFront(doc, fonts, arch);
  drawBack(doc, fonts, values);
  return doc.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
