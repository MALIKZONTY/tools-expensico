"use client";

import { useState } from "react";
import { Checkbox, Range, Select } from "@/components/ui/field";
import { ImageBatch } from "@/components/tool/ImageBatch";
import { processImage, type OutFormat } from "@/lib/image/process";

export default function ImageCompressor() {
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<OutFormat>("same");
  const [limit, setLimit] = useState(true);
  const [maxDim, setMaxDim] = useState(2560);

  return (
    <ImageBatch
      tool="image-compressor"
      actionLabel="Compress images"
      keepSmaller
      process={(it) => processImage(it.file, it.format, { format, quality: quality / 100, resize: limit ? { mode: "fit", maxWidth: maxDim, maxHeight: maxDim } : undefined })}
      settings={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm font-medium"><label htmlFor="q">Quality</label><span className="tabular-nums text-muted">{quality}%</span></div>
            <Range id="q" min={30} max={95} step={1} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            <p className="text-xs text-muted">70–80% is usually indistinguishable from the original on screen. PNG output is lossless and ignores this.</p>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium">Output format
            <Select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
              <option value="same">Same as original</option>
              <option value="webp">WebP (smallest, modern)</option>
              <option value="jpg">JPG (most compatible)</option>
              <option value="png">PNG (lossless)</option>
            </Select>
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Checkbox label="Limit dimensions" description="Large camera photos shrink most when they're also resized." checked={limit} onChange={(e) => setLimit(e.target.checked)} />
            {limit && (
              <Select aria-label="Maximum width or height" value={maxDim} onChange={(e) => setMaxDim(Number(e.target.value))} className="w-48">
                {[1080, 1280, 1600, 1920, 2560, 3840].map((d) => <option key={d} value={d}>Max {d}px</option>)}
              </Select>
            )}
          </div>
        </div>
      }
    />
  );
}
