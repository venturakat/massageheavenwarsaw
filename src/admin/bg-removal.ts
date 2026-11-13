/**
 * Background removal for team photos, in the browser (no server, no per-photo cost).
 *
 * Model: MODNet (portrait matting, Apache-2.0) via transformers.js (Apache-2.0).
 * The library is loaded only when "Usuń tło" is pressed. On first use the model is
 * downloaded from huggingface.co and the ONNX runtime from cdn.jsdelivr.net; the browser
 * caches both. Phase 2: the developer can self-host these files (env.localModelPath,
 * env.backends.onnx.wasm.wasmPaths) so the admin makes no third-party requests.
 */
const MODEL = 'Xenova/modnet';
const DTYPE = 'fp32'; // full model (~26 MB): the compressed one leaves rougher hair edges

type Progress = (percent: number | null) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenter: Promise<any> | null = null;

/** Returns a blob: URL of the photo as a PNG with a transparent background. */
export async function removeBackground(src: string, onDownload?: Progress): Promise<string> {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.allowLocalModels = false;

  if (!segmenter) {
    const files = new Map<string, { loaded: number; total: number }>();
    segmenter = pipeline('background-removal', MODEL, {
      dtype: DTYPE,
      progress_callback: (e: { status: string; file?: string; loaded?: number; total?: number; progress?: number }) => {
        // transformers.js 4 reports the overall download as "progress_total" (0–100).
        if (e.status === 'progress_total' && typeof e.progress === 'number' && e.progress > 0) {
          onDownload?.(Math.round(e.progress));
          return;
        }
        if (e.status !== 'progress' || !e.file || !e.total) return;
        files.set(e.file, { loaded: e.loaded ?? 0, total: e.total });
        let loaded = 0;
        let total = 0;
        for (const f of files.values()) {
          loaded += f.loaded;
          total += f.total;
        }
        onDownload?.(total ? Math.round((loaded / total) * 100) : null);
      },
    }).catch((err: unknown) => {
      segmenter = null; // let the next click try again (e.g. after a network error)
      throw err;
    });
  }
  const seg = await segmenter;
  const out = await seg(src);
  const canvas: HTMLCanvasElement | OffscreenCanvas = out.toCanvas();
  const blob =
    'convertToBlob' in canvas
      ? await canvas.convertToBlob({ type: 'image/png' })
      : await new Promise<Blob>((resolve, reject) => (canvas as HTMLCanvasElement).toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'));
  return URL.createObjectURL(blob);
}
