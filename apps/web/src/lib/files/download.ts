import { sanitizeFilename } from "@/lib/format";

/** Trigger a browser download for a Blob without leaking object URLs. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitizeFilename(filename, "download");
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser time to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function downloadText(text: string, filename: string, mime = "text/plain;charset=utf-8"): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

export interface NamedBlob {
  name: string;
  blob: Blob;
}

/** Ensure names are unique inside an archive: a.png, a (2).png … */
export function uniqueNames(items: NamedBlob[]): NamedBlob[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const name = sanitizeFilename(item.name);
    const count = seen.get(name.toLowerCase()) ?? 0;
    seen.set(name.toLowerCase(), count + 1);
    if (count === 0) return { ...item, name };
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    return { ...item, name: `${base} (${count + 1})${ext}` };
  });
}

export async function zipBlobs(items: NamedBlob[], onProgress?: (p: number) => void): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const item of uniqueNames(items)) zip.file(item.name, item.blob);
  return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, (meta) => onProgress?.(meta.percent / 100));
}
