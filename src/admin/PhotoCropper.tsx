/**
 * "Kadruj zdjęcie": square crop for a team portrait, shown in the same plum circle as the
 * website team card. Drag (mouse or finger) to move, slider / mouse wheel / + − to zoom,
 * arrow keys to move. Saves a square WebP (transparency kept), so the photo is never stretched.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dialog, LinkButton } from './ui';
import { removeBackground } from './bg-removal';

const OUT = 800; // px, the size the hint asks for
const MAX_ZOOM = 4;

type View = { zoom: number; x: number; y: number }; // x, y: image top-left in stage px

export function PhotoCropper({ src, onCancel, onSave }: { src: string | null; onCancel: () => void; onSave: (dataUrl: string) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [opaque, setOpaque] = useState(false);
  // Background removal: `current` is the photo shown (the original or the cut-out).
  const [current, setCurrent] = useState<string | null>(src);
  const [cutout, setCutout] = useState<string | null>(null);
  const [bg, setBg] = useState<{ state: 'idle' | 'download' | 'working' | 'error'; percent?: number | null }>({ state: 'idle' });
  const lastSize = useRef('');
  const [size, setSize] = useState(320); // stage width in px
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const drag = useRef<{ id: number; sx: number; sy: number; vx: number; vy: number } | null>(null);

  // A new photo to crop: start from it, forget any earlier cut-out.
  useEffect(() => {
    setCurrent(src);
    setCutout((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setBg({ state: 'idle' });
  }, [src]);

  // Load the image; start "cover", centred horizontally, top aligned (heads are at the top).
  useEffect(() => {
    if (!current) return;
    const i = new Image();
    i.onload = () => {
      setOpaque(!hasTransparency(i));
      setImg(i);
    };
    i.src = current;
  }, [current]);

  // Revoke the cut-out's blob URL when the pop-up goes away.
  useEffect(() => () => void (cutout && URL.revokeObjectURL(cutout)), [cutout]);

  const onRemoveBackground = async () => {
    if (!src) return;
    setBg({ state: 'download', percent: null });
    try {
      const url = await removeBackground(src, (percent) => setBg({ state: 'download', percent }));
      setCutout(url);
      setCurrent(url);
      setBg({ state: 'idle' });
    } catch (err) {
      console.error(err);
      setBg({ state: 'error' });
    }
  };
  const busy = bg.state === 'download' || bg.state === 'working';

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [img]);

  const base = img ? size / Math.min(img.naturalWidth, img.naturalHeight) : 1;
  const scale = base * view.zoom;
  const dw = img ? img.naturalWidth * scale : size;
  const dh = img ? img.naturalHeight * scale : size;

  const clamp = (v: View): View => {
    const s = base * v.zoom;
    const w = img ? img.naturalWidth * s : size;
    const h = img ? img.naturalHeight * s : size;
    return { zoom: v.zoom, x: Math.min(0, Math.max(size - w, v.x)), y: Math.min(0, Math.max(size - h, v.y)) };
  };

  useEffect(() => {
    if (!img) return;
    // Same size as before (the cut-out of the same photo): keep the crop the user set.
    const sizeKey = `${img.naturalWidth}x${img.naturalHeight}`;
    if (sizeKey === lastSize.current) return;
    lastSize.current = sizeKey;
    setView(clamp({ zoom: 1, x: (size - img.naturalWidth * base) / 2, y: 0 }));
  }, [img]);
  // Keep the crop valid if the stage is resized (e.g. phone rotated).
  useEffect(() => setView((v) => clamp(v)), [size]);

  /** Zoom around the centre of the circle. `zoom` may be a function of the current zoom. */
  const zoomTo = (zoom: number | ((current: number) => number)) =>
    setView((v) => {
      const z = Math.min(MAX_ZOOM, Math.max(1, typeof zoom === 'function' ? zoom(v.zoom) : zoom));
      const k = z / v.zoom;
      const c = size / 2;
      return clamp({ zoom: z, x: c - (c - v.x) * k, y: c - (c - v.y) * k });
    });

  // Mouse wheel zoom (needs a non-passive listener to stop the page scrolling).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => {
        const z = Math.min(MAX_ZOOM, Math.max(1, v.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));
        const k = z / v.zoom;
        const c = size / 2;
        return clamp({ zoom: z, x: c - (c - v.x) * k, y: c - (c - v.y) * k });
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [img, size]);

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 10;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomTo((z) => z * 1.1);
    } else if (e.key === '-') {
      e.preventDefault();
      zoomTo((z) => z / 1.1);
    }
  };

  const save = () => {
    if (!img) return;
    // Visible square in image pixels → 800 × 800 output.
    const sx = -view.x / scale;
    const sy = -view.y / scale;
    const side = size / scale;
    const c = document.createElement('canvas');
    c.width = OUT;
    c.height = OUT;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, side, side, 0, 0, OUT, OUT);
    onSave(c.toDataURL('image/webp', 0.88));
  };

  const cropSide = img ? Math.round(size / scale) : 0;
  // Warn only when it will visibly blur (the website circle is 290 px, 580 px on retina).
  const tooSmall = img && cropSide < 600;

  return (
    <Dialog
      open={Boolean(src)}
      onClose={onCancel}
      title="Kadruj"
      em="zdjęcie"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Anuluj
          </Button>
          <Button onClick={save} disabled={!img || busy}>
            Zapisz kadr
          </Button>
        </>
      }
    >
      <p class="muted">Przesuń zdjęcie, żeby ustawić twarz w kółku. Tak samo będzie wyglądać na stronie.</p>
      <div
        class={`cropper${drag.current ? ' is-dragging' : ''}`}
        ref={stage}
        tabIndex={0}
        role="group"
        aria-label="Kadr zdjęcia. Strzałki przesuwają zdjęcie, plus i minus przybliżają."
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          setView((v) => clamp({ ...v, x: d.vx + e.clientX - d.sx, y: d.vy + e.clientY - d.sy }));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {img && <img src={img.src} alt="" draggable={false} style={{ width: dw, height: dh, transform: `translate(${view.x}px, ${view.y}px)` }} />}
        <span class="cropper__ring" aria-hidden="true" />
      </div>

      <div class="cropper__zoom">
        <button type="button" class="cropper__step" aria-label="Oddal" onClick={() => zoomTo((z) => z / 1.15)} disabled={view.zoom <= 1}>
          −
        </button>
        <input
          type="range"
          min="1"
          max={MAX_ZOOM}
          step="0.01"
          value={view.zoom}
          aria-label="Przybliżenie"
          style={{ '--fill': `${((view.zoom - 1) / (MAX_ZOOM - 1)) * 100}%` }}
          onInput={(e) => zoomTo(Number((e.target as HTMLInputElement).value))}
        />
        <button type="button" class="cropper__step" aria-label="Przybliż" onClick={() => zoomTo((z) => z * 1.15)} disabled={view.zoom >= MAX_ZOOM}>
          +
        </button>
      </div>

      {opaque && !cutout && (
        <div class="bg-notice">
          <div class="bg-notice__text">
            <p class="body-medium">To zdjęcie ma własne tło</p>
            <p class="small muted">
              {busy
                ? bg.state === 'download' && bg.percent != null && bg.percent < 100
                  ? `Pobieram narzędzie… ${bg.percent}% (tylko za pierwszym razem)`
                  : 'Usuwam tło… to potrwa kilka sekund.'
                : 'Na stronie byłoby widać je zamiast śliwkowego koła. Usuń je tutaj albo wgraj wycięte zdjęcie (PNG).'}
            </p>
            {bg.state === 'error' && (
              <p class="small plum" role="alert">
                Nie udało się usunąć tła. Sprawdź internet i spróbuj jeszcze raz.
              </p>
            )}
          </div>
          <Button variant="secondary" class="btn--small" onClick={onRemoveBackground} disabled={busy}>
            {busy ? 'Usuwam…' : 'Usuń tło'}
          </Button>
          {busy && <span class="sr-only" role="status">Usuwam tło</span>}
        </div>
      )}
      {cutout && (
        <div class="bg-notice bg-notice--done">
          <div class="bg-notice__text">
            <p class="body-medium">Tło usunięte</p>
            <p class="small muted">Sprawdź brzegi, zwłaszcza włosy.</p>
          </div>
          <LinkButton
            icon="x"
            onClick={() => {
              setCurrent(src);
              setCutout((old) => {
                if (old) URL.revokeObjectURL(old);
                return null;
              });
            }}
          >
            Cofnij
          </LinkButton>
        </div>
      )}
      {tooSmall && (
        <p class="small plum">
          Ten kadr ma tylko {cropSide} × {cropSide} px — na stronie może być nieostry. Mniej przybliż albo użyj większego zdjęcia.
        </p>
      )}
    </Dialog>
  );
}

/** True when the photo has a transparent background (a cut-out), checked on a small copy. */
function hasTransparency(img: HTMLImageElement): boolean {
  const n = 64;
  const c = document.createElement('canvas');
  c.width = n;
  c.height = n;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return true;
  let data: Uint8ClampedArray;
  try {
    ctx.drawImage(img, 0, 0, n, n);
    data = ctx.getImageData(0, 0, n, n).data;
  } catch {
    return true; // can't read the pixels: don't warn
  }
  let clear = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 200) clear++;
  return clear > n * n * 0.02; // at least 2 % see-through pixels
}

