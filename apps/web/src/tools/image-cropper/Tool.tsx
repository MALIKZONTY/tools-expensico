"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Range, Select } from "@/components/ui/field";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { validateFile } from "@/lib/files/validate";
import { toToolError, type ToolError } from "@/lib/files/errors";
import { processImage, type OutFormat } from "@/lib/image/process";
import { downloadBlob } from "@/lib/files/download";
import type { FormatId } from "@/lib/convert/formats";
import { formatBytes } from "@/lib/format";

const RATIOS: { label: string; r: number | null }[] = [
  { label: "Free", r: null },
  { label: "1:1 Square", r: 1 },
  { label: "4:5 Portrait", r: 4 / 5 },
  { label: "3:4", r: 3 / 4 },
  { label: "4:3", r: 4 / 3 },
  { label: "16:9", r: 16 / 9 },
  { label: "9:16 Story", r: 9 / 16 },
  { label: "3:2", r: 3 / 2 },
  { label: "Passport 35:45", r: 35 / 45 },
];

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
type Handle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

function clampRect(r: Rect, W: number, H: number): Rect {
  const w = Math.max(1, Math.min(r.w, W));
  const h = Math.max(1, Math.min(r.h, H));
  return { x: Math.min(Math.max(0, r.x), W - w), y: Math.min(Math.max(0, r.y), H - h), w, h };
}

function fitRatio(W: number, H: number, ratio: number | null): Rect {
  if (!ratio) return { x: Math.round(W * 0.1), y: Math.round(H * 0.1), w: Math.round(W * 0.8), h: Math.round(H * 0.8) };
  let w = W * 0.9;
  let h = w / ratio;
  if (h > H * 0.9) {
    h = H * 0.9;
    w = h * ratio;
  }
  return { x: Math.round((W - w) / 2), y: Math.round((H - h) / 2), w: Math.round(w), h: Math.round(h) };
}

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFmt] = useState<FormatId>("jpg");
  const [url, setUrl] = useState<string | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [ratioIdx, setRatioIdx] = useState(0);
  const [out, setOut] = useState<OutFormat>("same");
  const [quality, setQuality] = useState(92);
  const [error, setError] = useState<ToolError | null>(null);
  const [busy, setBusy] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ h: Handle; sx: number; sy: number; start: Rect; scale: number } | null>(null);
  const ratio = RATIOS[ratioIdx].r;

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  async function open(f: File) {
    setError(null);
    try {
      const v = await validateFile(f, { accept: ["jpg", "png", "webp", "gif", "bmp", "avif"], maxBytes: 60 * 1024 * 1024 });
      setFile(f);
      setFmt(v.format);
      setNat(null);
      setUrl(URL.createObjectURL(f));
    } catch (e) {
      setError(toToolError(e));
    }
  }

  function onDown(e: React.PointerEvent, h: Handle) {
    e.preventDefault();
    e.stopPropagation();
    const el = stage.current;
    if (!el || !nat) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { h, sx: e.clientX, sy: e.clientY, start: rect, scale: nat.w / el.clientWidth };
  }

  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || !nat) return;
    const dx = (e.clientX - d.sx) * d.scale;
    const dy = (e.clientY - d.sy) * d.scale;
    const s = d.start;
    let r: Rect = { ...s };
    if (d.h === "move") r = { ...s, x: s.x + dx, y: s.y + dy };
    else {
      let { x, y, w, h } = s;
      if (d.h.includes("e")) w = s.w + dx;
      if (d.h.includes("s")) h = s.h + dy;
      if (d.h.includes("w")) { x = s.x + dx; w = s.w - dx; }
      if (d.h.includes("n")) { y = s.y + dy; h = s.h - dy; }
      if (ratio) {
        if (d.h === "n" || d.h === "s") w = h * ratio;
        else h = w / ratio;
        if (d.h.includes("n")) y = s.y + s.h - h;
        if (d.h.includes("w")) x = s.x + s.w - w;
      }
      r = { x, y, w: Math.max(10, w), h: Math.max(10, h) };
    }
    setRect(clampRect({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }, nat.w, nat.h));
  }

  function nudge(e: React.KeyboardEvent) {
    if (!nat) return;
    const step = e.shiftKey ? 10 : 1;
    const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const v = m[e.key];
    if (!v) return;
    e.preventDefault();
    setRect((r) => clampRect({ ...r, x: r.x + v[0], y: r.y + v[1] }, nat.w, nat.h));
  }

  if (!file || !url) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <FileDropzone accept={["jpg", "png", "webp", "gif", "bmp", "avif"]} maxBytes={60 * 1024 * 1024} onFiles={([f]) => open(f)} label="Choose an image" />
        {error && <ToolErrorAlert error={error} />}
      </div>
    );
  }

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const handles: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  const pos: Record<Handle, string> = { nw: "-left-2 -top-2 cursor-nwse-resize", n: "left-1/2 -top-2 -translate-x-1/2 cursor-ns-resize", ne: "-right-2 -top-2 cursor-nesw-resize", e: "-right-2 top-1/2 -translate-y-1/2 cursor-ew-resize", se: "-right-2 -bottom-2 cursor-nwse-resize", s: "left-1/2 -bottom-2 -translate-x-1/2 cursor-ns-resize", sw: "-left-2 -bottom-2 cursor-nesw-resize", w: "-left-2 top-1/2 -translate-y-1/2 cursor-ew-resize", move: "" };

  return (
    <div className="grid grid-cols-1 gap-6 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="checkerboard flex items-center justify-center overflow-hidden rounded-lg p-2">
        <div ref={stage} className="relative max-h-[70vh] touch-none select-none" onPointerMove={onMove} onPointerUp={() => (drag.current = null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Image to crop"
            className="block max-h-[70vh] max-w-full"
            draggable={false}
            onLoad={(e) => {
              const w = e.currentTarget.naturalWidth;
              const h = e.currentTarget.naturalHeight;
              setNat({ w, h });
              setRect(fitRatio(w, h, ratio));
            }}
          />
          {nat && (
            <>
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/45" style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${pct(rect.x, nat.w)} ${pct(rect.y, nat.h)}, ${pct(rect.x, nat.w)} ${pct(rect.y + rect.h, nat.h)}, ${pct(rect.x + rect.w, nat.w)} ${pct(rect.y + rect.h, nat.h)}, ${pct(rect.x + rect.w, nat.w)} ${pct(rect.y, nat.h)}, ${pct(rect.x, nat.w)} ${pct(rect.y, nat.h)})` }} />
              <div
                role="group"
                aria-roledescription="crop area"
                tabIndex={0}
                aria-label={`Crop area, ${rect.w} by ${rect.h} pixels at ${rect.x}, ${rect.y}. Drag to move, or use arrow keys to nudge (Shift for 10 pixels).`}
                onKeyDown={nudge}
                onPointerDown={(e) => onDown(e, "move")}
                className="absolute cursor-move border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-ring"
                style={{ left: pct(rect.x, nat.w), top: pct(rect.y, nat.h), width: pct(rect.w, nat.w), height: pct(rect.h, nat.h) }}
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }, (_, k) => <span key={k} className="border border-white/30" />)}
                </div>
                {handles.map((h) => (
                  <span key={h} aria-hidden onPointerDown={(e) => onDown(e, h)} className={`absolute size-4 rounded-sm border-2 border-white bg-brand ${pos[h]}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <aside className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">Aspect ratio
          <Select value={ratioIdx} onChange={(e) => { const i = Number(e.target.value); setRatioIdx(i); if (nat) setRect(fitRatio(nat.w, nat.h, RATIOS[i].r)); }}>
            {RATIOS.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
          </Select>
        </label>
        {nat && (
          <div className="grid grid-cols-2 gap-2">
            {(["x", "y", "w", "h"] as const).map((k) => (
              <label key={k} className="flex flex-col gap-1 text-xs font-medium text-muted">{k === "w" ? "Width" : k === "h" ? "Height" : k.toUpperCase()} (px)
                <Input type="number" min={0} value={rect[k]} onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  const next = { ...rect, [k]: v };
                  if (ratio && k === "w") next.h = Math.round(v / ratio);
                  if (ratio && k === "h") next.w = Math.round(v * ratio);
                  setRect(clampRect(next, nat.w, nat.h));
                }} className="h-9 tabular-nums" />
              </label>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-medium">Output format
          <Select value={out} onChange={(e) => setOut(e.target.value as OutFormat)}>
            <option value="same">Same as original</option><option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option>
          </Select>
        </label>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm font-medium"><label htmlFor="cq">Quality</label><span className="tabular-nums text-muted">{quality}%</span></div>
          <Range id="cq" min={50} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
        </div>
        {error && <ToolErrorAlert error={error} />}
        <Button loading={busy} disabled={!nat} onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const r = await processImage(file, format, { format: out, quality: quality / 100, crop: rect });
            downloadBlob(r.blob, r.name.replace(/(\.[^.]+)$/, "-cropped$1"));
          } catch (e) {
            setError(toToolError(e));
          } finally {
            setBusy(false);
          }
        }}>
          <Download aria-hidden /> Crop and download
        </Button>
        <Button variant="ghost" onClick={() => { setFile(null); setUrl(null); }}><RotateCcw aria-hidden /> Choose another image</Button>
        <p className="text-xs text-muted">{file.name} · {nat ? `${nat.w} × ${nat.h}` : ""} · {formatBytes(file.size)}</p>
      </aside>
    </div>
  );
}
