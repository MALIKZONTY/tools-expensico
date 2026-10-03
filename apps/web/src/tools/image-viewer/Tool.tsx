"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize, Minus, Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { validateFile } from "@/lib/files/validate";
import { toToolError, type ToolError } from "@/lib/files/errors";
import { FORMATS, type FormatId } from "@/lib/convert/formats";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

const ACCEPT: FormatId[] = ["jpg", "png", "webp", "gif", "avif", "bmp", "svg"];
const MAX = 100 * 1024 * 1024;

interface Img {
  file: File;
  url: string;
  format: FormatId;
  w?: number;
  h?: number;
}

export default function ImageViewer() {
  const [images, setImages] = useState<Img[]>([]);
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const [rot, setRot] = useState(0);
  const [bg, setBg] = useState<"checker" | "light" | "dark">("checker");
  const [errors, setErrors] = useState<ToolError[]>([]);
  const cur = images[i];

  // Free every preview URL when leaving the page (a ref, so the cleanup sees the latest list).
  const latest = useRef(images);
  useEffect(() => {
    latest.current = images;
  }, [images]);
  useEffect(() => () => latest.current.forEach((im) => URL.revokeObjectURL(im.url)), []);

  async function add(files: File[]) {
    const ok: Img[] = [];
    const errs: ToolError[] = [];
    for (const f of files) {
      try {
        const v = await validateFile(f, { accept: ACCEPT, maxBytes: MAX });
        ok.push({ file: f, url: URL.createObjectURL(f), format: v.format });
      } catch (e) {
        errs.push(toToolError(e));
      }
    }
    setImages((p) => [...p, ...ok]);
    setErrors(errs);
  }

  const go = (d: number) => {
    setI((x) => (x + d + images.length) % images.length);
    setZoom("fit");
    setRot(0);
  };

  useEffect(() => {
    if (images.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const style = useMemo(() => ({ transform: `rotate(${rot}deg)`, ...(zoom === "fit" ? { maxWidth: "100%", maxHeight: "68vh" } : { width: cur?.w ? cur.w * zoom : undefined, maxWidth: "none" }) }), [rot, zoom, cur]);

  if (!images.length) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <FileDropzone accept={ACCEPT} multiple maxBytes={MAX} onFiles={add} label="Choose images" />
        {errors.map((e, k) => <ToolErrorAlert key={k} error={e} />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
        {images.length > 1 && (
          <>
            <Button variant="ghost" size="icon-sm" onClick={() => go(-1)} aria-label="Previous image"><ChevronLeft aria-hidden /></Button>
            <span className="text-sm tabular-nums text-muted">{i + 1} / {images.length}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => go(1)} aria-label="Next image"><ChevronRight aria-hidden /></Button>
          </>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.1, (z === "fit" ? 1 : z) / 1.25))}><Minus aria-hidden /></Button>
        <span className="w-12 text-center text-xs tabular-nums text-muted">{zoom === "fit" ? "Fit" : `${Math.round(zoom * 100)}%`}</span>
        <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(16, (z === "fit" ? 1 : z) * 1.25))}><Plus aria-hidden /></Button>
        <Button variant="ghost" size="sm" onClick={() => setZoom("fit")}><Maximize aria-hidden /> Fit</Button>
        <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>100%</Button>
        <Button variant="ghost" size="icon-sm" aria-label="Rotate" onClick={() => setRot((r) => (r + 90) % 360)}><RotateCw aria-hidden /></Button>
        <div className="ml-auto flex gap-1" role="group" aria-label="Background">
          {(["checker", "light", "dark"] as const).map((b) => (
            <button key={b} type="button" aria-pressed={bg === b} aria-label={`${b} background`} onClick={() => setBg(b)} className={cn("size-7 rounded border", bg === b ? "border-brand ring-1 ring-brand" : "border-border", b === "checker" ? "checkerboard" : b === "light" ? "bg-white" : "bg-neutral-900")} />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => { images.forEach((im) => URL.revokeObjectURL(im.url)); setImages([]); setI(0); }}>Close</Button>
      </div>
      <div className={cn("flex min-h-[50vh] items-center justify-center overflow-auto p-4", bg === "checker" ? "checkerboard" : bg === "light" ? "bg-white" : "bg-neutral-900")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={cur.url}
          src={cur.url}
          alt={cur.file.name}
          style={style}
          className="transition-transform"
          onLoad={(e) => {
            const el = e.currentTarget;
            setImages((p) => p.map((im, k) => (k === i ? { ...im, w: el.naturalWidth, h: el.naturalHeight } : im)));
          }}
        />
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border px-4 py-2.5 text-sm">
        <div className="flex gap-1.5"><dt className="text-muted">File</dt><dd className="max-w-[16rem] truncate">{cur.file.name}</dd></div>
        <div className="flex gap-1.5"><dt className="text-muted">Type</dt><dd>{FORMATS[cur.format].label}</dd></div>
        <div className="flex gap-1.5"><dt className="text-muted">Size</dt><dd>{formatBytes(cur.file.size)}</dd></div>
        {cur.w && <div className="flex gap-1.5"><dt className="text-muted">Dimensions</dt><dd className="tabular-nums">{cur.w} × {cur.h} px ({((cur.w * (cur.h ?? 0)) / 1e6).toFixed(1)} MP)</dd></div>}
      </dl>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto border-t border-border p-2">
          {images.map((im, k) => (
            <li key={im.url}>
              <button type="button" onClick={() => { setI(k); setZoom("fit"); setRot(0); }} aria-label={`View ${im.file.name}`} aria-current={k === i} className={cn("block size-16 overflow-hidden rounded border-2", k === i ? "border-brand" : "border-transparent")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
