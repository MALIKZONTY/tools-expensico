import { ToolError } from "@/lib/files/errors";
import { MAX_CANVAS_PIXELS, canvasToBlob } from "@/lib/pdf/pdfjs";

export { canvasToBlob };

export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

function loadViaImgElement(file: Blob, isSvg: boolean): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      if (isSvg && (!width || !height)) {
        width = 300;
        height = 150;
      }
      resolve({ source: img, width, height, close: () => URL.revokeObjectURL(url) });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ToolError("corrupted", "The image couldn't be decoded. It may be damaged or in a format your browser doesn't support."));
    };
    img.src = url;
  });
}

/**
 * Decode an image file. EXIF orientation is applied so photos appear upright.
 * SVGs are loaded through <img>, which never runs scripts or fetches external resources.
 */
export async function decodeImage(file: File | Blob, opts: { isSvg?: boolean } = {}): Promise<DecodedImage> {
  const isSvg = opts.isSvg ?? (file.type === "image/svg+xml" || (file instanceof File && /\.svg$/i.test(file.name)));
  if (!isSvg && typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      // Fall through to <img>, which supports a few formats createImageBitmap doesn't.
    }
  }
  return loadViaImgElement(file, isSvg);
}

export function assertCanvasSize(width: number, height: number) {
  if (width < 1 || height < 1) throw new ToolError("invalid-format", "The output size must be at least 1 × 1 pixel.");
  if (width * height > MAX_CANVAS_PIXELS || width > 16384 || height > 16384) {
    throw new ToolError("too-large", `${width} × ${height} px is larger than browsers can safely process (about 16 megapixels).`, {
      title: "Image dimensions too large",
      hint: "Choose a smaller size or scale.",
    });
  }
}

export function createCanvas(width: number, height: number, background?: string): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  assertCanvasSize(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ToolError("browser-unsupported");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

/**
 * Draw `source` scaled to width × height. Large reductions are done in halving steps,
 * which avoids the aliasing a single big downscale produces.
 */
export function drawScaled(source: CanvasImageSource, sw: number, sh: number, width: number, height: number, background?: string, crop?: { x: number; y: number; w: number; h: number }): HTMLCanvasElement {
  let src: CanvasImageSource = source;
  let cw = crop ? crop.w : sw;
  let ch = crop ? crop.h : sh;
  let sx = crop?.x ?? 0;
  let sy = crop?.y ?? 0;

  while (cw / 2 >= width && ch / 2 >= height && cw * ch > 4_000_000) {
    const nw = Math.round(cw / 2);
    const nh = Math.round(ch / 2);
    const step = createCanvas(nw, nh);
    step.ctx.drawImage(src, sx, sy, cw, ch, 0, 0, nw, nh);
    src = step.canvas;
    cw = nw;
    ch = nh;
    sx = 0;
    sy = 0;
  }
  const { canvas, ctx } = createCanvas(width, height, background);
  ctx.drawImage(src, sx, sy, cw, ch, 0, 0, width, height);
  return canvas;
}

export async function supportsEncoding(mime: string): Promise<boolean> {
  const c = document.createElement("canvas");
  c.width = c.height = 2;
  return new Promise((resolve) => c.toBlob((b) => resolve(Boolean(b && b.type === mime)), mime));
}
