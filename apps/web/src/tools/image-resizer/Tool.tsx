"use client";

import { useState } from "react";
import { Link2, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Range, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { ImageBatch } from "@/components/tool/ImageBatch";
import { processImage, type OutFormat, type ProcessOptions } from "@/lib/image/process";

const PRESETS = [
  { label: "Instagram square", w: 1080, h: 1080 },
  { label: "Instagram portrait", w: 1080, h: 1350 },
  { label: "Full HD (16:9)", w: 1920, h: 1080 },
  { label: "WhatsApp/Facebook cover", w: 1640, h: 924 },
  { label: "YouTube thumbnail", w: 1280, h: 720 },
  { label: "Passport photo 35×45 mm @300 DPI", w: 413, h: 531 },
  { label: "Indian visa photo 2×2 in @300 DPI", w: 600, h: 600 },
];

export default function ImageResizer() {
  const [mode, setMode] = useState<"pixels" | "percent">("pixels");
  const [w, setW] = useState(1920);
  const [h, setH] = useState(1080);
  const [lock, setLock] = useState(true);
  const [percent, setPercent] = useState(50);
  const [format, setFormat] = useState<OutFormat>("same");
  const [quality, setQuality] = useState(90);

  const resize = (): ProcessOptions["resize"] => {
    if (mode === "percent") return { mode: "scale", percent };
    if (lock) return { mode: "fit", maxWidth: Math.max(1, w), maxHeight: Math.max(1, h), upscale: true };
    return { mode: "exact", width: Math.max(1, w), height: Math.max(1, h) };
  };

  return (
    <ImageBatch
      tool="image-resizer"
      actionLabel="Resize images"
      process={(it) => processImage(it.file, it.format, { format, quality: quality / 100, resize: resize() })}
      settings={
        <div className="flex flex-col gap-4">
          <Segmented label="Resize by" value={mode} onChange={setMode} options={[{ value: "pixels", label: "Pixels" }, { value: "percent", label: "Percentage" }]} />
          {mode === "pixels" ? (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1 text-sm font-medium">Width (px)<Input type="number" min={1} max={16000} value={w} onChange={(e) => setW(Number(e.target.value))} className="w-32" /></label>
                <Button variant="ghost" size="icon" aria-pressed={lock} aria-label={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"} title={lock ? "Keep aspect ratio (fit inside the box)" : "Exact size (may stretch)"} onClick={() => setLock((l) => !l)}>
                  {lock ? <Link2 aria-hidden /> : <Link2Off aria-hidden />}
                </Button>
                <label className="flex flex-col gap-1 text-sm font-medium">Height (px)<Input type="number" min={1} max={16000} value={h} onChange={(e) => setH(Number(e.target.value))} className="w-32" /></label>
                <Select aria-label="Size presets" value="" onChange={(e) => { const p = PRESETS[Number(e.target.value)]; if (p) { setW(p.w); setH(p.h); } }} className="w-64">
                  <option value="">Presets…</option>
                  {PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label} ({p.w}×{p.h})</option>)}
                </Select>
              </div>
              <p className="text-xs text-muted">{lock ? "Aspect ratio kept: each image is scaled to fit inside this box without distortion." : "Exact size: images are stretched to exactly these dimensions. Crop first to avoid distortion."}</p>
            </>
          ) : (
            <div className="flex max-w-md flex-col gap-1.5">
              <div className="flex justify-between text-sm font-medium"><label htmlFor="pct">Scale</label><span className="tabular-nums text-muted">{percent}%</span></div>
              <Range id="pct" min={5} max={400} step={5} value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">Output format
              <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
                <option value="same">Same as original</option><option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option>
              </Select>
            </label>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm font-medium"><label htmlFor="rq">Quality (JPG/WebP)</label><span className="tabular-nums text-muted">{quality}%</span></div>
              <Range id="rq" min={40} max={100} step={1} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            </div>
          </div>
        </div>
      }
    />
  );
}
