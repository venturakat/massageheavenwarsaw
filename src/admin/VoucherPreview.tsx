/** "Podgląd bonu": the printed voucher at trim size, back or front (Figma 522:6472). Same layout as the PDF. */
import { useEffect, useRef, useState } from 'preact/hooks';
import { ART, BACK, BLEED_PX, FRONT, SLOT, SLOTS, fitValue, type FontKey, type TextSpec, type VoucherValues } from './pdf/voucher-layout';
import { Chips } from './ui';
import logoWhite from '../assets/brand/logo-white.svg?url';
import signWhite from '../assets/brand/sign-white.svg?url';
import arch from './pdf/arch.jpg?url';

const FONT_CSS: Record<FontKey, string> = {
  serif: '400 {s}px "Instrument Serif"',
  serifItalic: 'italic 400 {s}px "Instrument Serif"',
  sans: '400 {s}px "Instrument Sans"',
  sansMedium: '500 {s}px "Instrument Sans"',
  sansSemibold: '600 {s}px "Instrument Sans"',
};
const font = (k: FontKey, size: number) => FONT_CSS[k].replace('{s}', String(size));

let ctx: CanvasRenderingContext2D | null = null;
const measure = (k: FontKey) => (text: string, size: number) => {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return 0;
  ctx.font = font(k, size);
  return ctx.measureText(text).width;
};

function Line({ spec, text, top = spec.y, size = spec.size }: { spec: TextSpec; text: string; top?: number; size?: number }) {
  return (
    <span
      class="vp__text"
      style={{
        left: spec.align === 'right' ? undefined : spec.x,
        right: spec.align === 'right' ? ART.width - spec.x : undefined,
        top,
        width: spec.width,
        font: font(spec.font, size),
        lineHeight: `${spec.lineHeight}px`,
        letterSpacing: spec.tracking ? `${spec.tracking}em` : undefined,
        textTransform: spec.upper ? 'uppercase' : undefined,
        color: spec.color,
        whiteSpace: spec.width ? 'pre-line' : 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

export function VoucherPreview({ values }: { values: VoucherValues }) {
  const [side, setSide] = useState<'back' | 'front'>('back');
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const [, setFontsReady] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / (ART.width - 2 * BLEED_PX)));
    ro.observe(el);
    document.fonts?.ready.then(() => setFontsReady((n) => n + 1));
    return () => ro.disconnect();
  }, []);

  return (
    <div class="vp">
      <Chips
        label="Strona bonu"
        value={side}
        onChange={setSide}
        options={[
          { value: 'back', label: 'Tył' },
          { value: 'front', label: 'Przód' },
        ]}
      />
      <div class="vp__trim" ref={box} style={{ aspectRatio: `${ART.width - 2 * BLEED_PX} / ${ART.height - 2 * BLEED_PX}` }} role="img" aria-label={side === 'back' ? 'Tył bonu z danymi z zamówienia' : 'Przód bonu'}>
        <div class="vp__art" style={{ width: ART.width, height: ART.height, transform: `scale(${scale}) translate(${-BLEED_PX}px, ${-BLEED_PX}px)` }}>
          {side === 'front' ? (
            <div class="vp__page" style={{ background: FRONT.background }}>
              <span class="vp__halo" style={{ left: FRONT.halo.x, top: FRONT.halo.y, width: FRONT.halo.w, height: FRONT.halo.h, borderWidth: FRONT.halo.stroke, borderColor: FRONT.halo.color }} />
              <img class="vp__arch" src={arch} alt="" style={{ left: FRONT.arch.x, top: FRONT.arch.y, width: FRONT.arch.w, height: FRONT.arch.h, borderRadius: `${FRONT.arch.radius}px ${FRONT.arch.radius}px 0 0` }} />
              <img class="vp__abs" src={logoWhite} alt="" style={{ left: FRONT.logo.x, top: FRONT.logo.y, width: FRONT.logo.w, height: FRONT.logo.h }} />
              {[FRONT.titlePl, FRONT.titleEn, FRONT.tagline, FRONT.address, FRONT.website].map((s) => (
                <Line spec={s} text={s.text} />
              ))}
              <span class="vp__abs" style={{ left: FRONT.divider.x, top: FRONT.divider.y, width: FRONT.divider.w, height: FRONT.divider.h, background: FRONT.divider.color }} />
            </div>
          ) : (
            <div class="vp__page" style={{ background: BACK.background }}>
              <span class="vp__text" style={{ left: BACK.heading.x, top: BACK.heading.y, font: font('serif', BACK.heading.size), lineHeight: `${BACK.heading.lineHeight}px`, color: BACK.heading.color, whiteSpace: 'nowrap' }}>
                {BACK.heading.regular}
                <span style={{ fontStyle: 'italic' }}>{BACK.heading.italic}</span>
              </span>
              {SLOTS.map((slot) => {
                const v = values[slot.key]?.trim();
                const fit = v ? fitValue(v, slot.width, measure(SLOT.value.font)) : null;
                return (
                  <>
                    <Line spec={{ ...SLOT.label, x: slot.x, y: slot.y, upper: true }} text={slot.label} />
                    {fit && <Line spec={{ font: SLOT.value.font, x: slot.x, y: slot.y + SLOT.value.dy, size: fit.size, lineHeight: SLOT.value.lineHeight, color: SLOT.value.color }} text={fit.text} size={fit.size} />}
                    <span class="vp__abs" style={{ left: slot.x, top: slot.y + SLOT.rule.dy, width: slot.width, height: SLOT.rule.h, background: SLOT.rule.color }} />
                  </>
                );
              })}
              <span class="vp__abs" style={{ left: BACK.divider.x, top: BACK.divider.y, width: BACK.divider.w, height: BACK.divider.h, background: BACK.divider.color }} />
              <span class="vp__abs vp__icon" style={{ left: BACK.icon.x, top: BACK.icon.y, width: BACK.icon.d, height: BACK.icon.d, background: BACK.icon.color }}>
                <img src={signWhite} alt="" style={{ left: BACK.icon.sign.dx, top: BACK.icon.sign.dy, width: BACK.icon.sign.w, height: BACK.icon.sign.h }} />
              </span>
              {BACK.terms.map((b) => (
                <Line spec={b} text={b.text} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
