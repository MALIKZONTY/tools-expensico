"use client";

import { useState } from "react";
import { Download, MapPin, ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/progress";
import { FileChip } from "@/components/tool/FileChip";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { validateFile } from "@/lib/files/validate";
import { toToolError, type ToolError } from "@/lib/files/errors";
import { downloadBlob } from "@/lib/files/download";
import { stripJpegMetadata, stripPngMetadata } from "@/lib/image/strip-metadata";
import { processImage } from "@/lib/image/process";
import type { FormatId } from "@/lib/convert/formats";
import { stripExtension } from "@/lib/format";

type Tags = Record<string, unknown>;

const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Camera", keys: ["Make", "Model", "LensModel", "Software"] },
  { title: "Capture", keys: ["DateTimeOriginal", "CreateDate", "ExposureTime", "FNumber", "ISO", "FocalLength", "FocalLengthIn35mmFormat", "Flash", "WhiteBalance"] },
  { title: "Image", keys: ["ImageWidth", "ImageHeight", "ExifImageWidth", "ExifImageHeight", "Orientation", "ColorSpace", "XResolution", "YResolution"] },
  { title: "Author & rights", keys: ["Artist", "Copyright", "ImageDescription", "creator", "rights", "title", "description"] },
];

function show(v: unknown): string {
  if (v instanceof Date) return v.toLocaleString("en-IN");
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(4).replace(/0+$/, "");
  if (Array.isArray(v)) return v.map(show).join(", ");
  if (v && typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function ImageMetadata() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<FormatId>("jpg");
  const [tags, setTags] = useState<Tags | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [loading, setLoading] = useState(false);

  async function open(f: File) {
    setError(null);
    setTags(null);
    setLoading(true);
    try {
      const v = await validateFile(f, { accept: ["jpg", "png", "webp", "avif"], maxBytes: 100 * 1024 * 1024 });
      setFile(f);
      setFormat(v.format);
      const exifr = await import("exifr");
      const t = (await exifr.parse(f, { tiff: true, exif: true, gps: true, xmp: true, iptc: true, icc: false, mergeOutput: true, translateValues: true, reviveValues: true })) as Tags | undefined;
      setTags(t ?? {});
    } catch (e) {
      setError(toToolError(e));
    } finally {
      setLoading(false);
    }
  }

  async function strip() {
    if (!file) return;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const orientation = Number(tags?.Orientation ?? 1);
      const rotated = typeof tags?.Orientation === "string" ? !/horizontal \(normal\)/i.test(String(tags.Orientation)) : orientation !== 1;
      let blob: Blob;
      if (format === "jpg" && !rotated) blob = new Blob([stripJpegMetadata(bytes) as BlobPart], { type: "image/jpeg" });
      else if (format === "png") blob = new Blob([stripPngMetadata(bytes) as BlobPart], { type: "image/png" });
      else blob = (await processImage(file, format, { format: "same", quality: 0.95 })).blob;
      downloadBlob(blob, `${stripExtension(file.name)}-no-metadata.${format === "jpg" ? "jpg" : format === "png" ? "png" : format}`);
    } catch (e) {
      setError(toToolError(e));
    }
  }

  const lat = tags?.latitude as number | undefined;
  const lon = tags?.longitude as number | undefined;
  const count = tags ? Object.keys(tags).length : 0;
  const used = new Set(GROUPS.flatMap((g) => g.keys).concat(["latitude", "longitude"]));
  const other = tags ? Object.entries(tags).filter(([k, v]) => !used.has(k) && v !== undefined && typeof v !== "object").slice(0, 60) : [];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      {!file ? (
        <FileDropzone accept={["jpg", "png", "webp", "avif"]} maxBytes={100 * 1024 * 1024} onFiles={([f]) => open(f)} label="Choose a photo" />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <FileChip className="min-w-0 flex-1" file={file} meta={tags ? `${count} metadata field${count === 1 ? "" : "s"}` : undefined} />
          <Button variant="ghost" size="sm" onClick={() => { setFile(null); setTags(null); }}>Open another</Button>
        </div>
      )}
      {loading && <Spinner label="Reading metadata" />}
      {error && <ToolErrorAlert error={error} />}
      {tags && (
        <>
          {count === 0 ? (
            <Alert tone="success" title="No metadata found">This image doesn&apos;t contain EXIF, GPS, IPTC or XMP data.</Alert>
          ) : (
            <Alert tone={lat !== undefined ? "warning" : "info"} title={lat !== undefined ? "This photo contains its GPS location" : "This photo contains metadata"} actions={<Button size="sm" onClick={strip}><ShieldCheck aria-hidden /> Download without metadata</Button>}>
              {lat !== undefined ? "Anyone you send the original file to can see where it was taken." : "Camera details and dates are embedded in the file."} Removing metadata doesn&apos;t change the picture{format === "jpg" || format === "png" ? " — JPG and PNG files aren't re-compressed" : ""}.
            </Alert>
          )}
          {lat !== undefined && lon !== undefined && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4">
              <MapPin aria-hidden className="size-5 text-danger" />
              <span className="font-mono text-sm">{lat.toFixed(6)}, {lon.toFixed(6)}</span>
              <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`} target="_blank" rel="noopener noreferrer nofollow" className="text-sm font-medium text-brand hover:underline">
                Open in OpenStreetMap
              </a>
              <span className="text-xs text-muted">(opens an external site)</span>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {GROUPS.map((g) => {
              const rows = g.keys.filter((k) => tags[k] !== undefined && tags[k] !== "");
              if (!rows.length) return null;
              return (
                <section key={g.title} className="rounded-lg border border-border p-4">
                  <h2 className="text-sm font-semibold">{g.title}</h2>
                  <dl className="mt-2 grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm">
                    {rows.map((k) => (
                      <div key={k} className="contents">
                        <dt className="truncate text-muted">{k}</dt>
                        <dd className="break-words">{show(tags[k])}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}
          </div>
          {other.length > 0 && (
            <details className="rounded-lg border border-border p-4">
              <summary className="cursor-pointer text-sm font-semibold">All other fields ({other.length})</summary>
              <dl className="mt-3 grid grid-cols-[minmax(8rem,14rem)_1fr] gap-x-3 gap-y-1 text-sm">
                {other.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="truncate text-muted">{k}</dt>
                    <dd className="break-words">{show(v)}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
          <Button variant="secondary" className="self-start" onClick={() => downloadBlob(new Blob([JSON.stringify(tags, null, 2)], { type: "application/json" }), `${stripExtension(file!.name)}-metadata.json`)} disabled={!count}>
            <Download aria-hidden /> Export metadata as JSON
          </Button>
        </>
      )}
    </div>
  );
}
