"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { cn } from "@/lib/cn";

/** Renders a page thumbnail only when it scrolls into view. */
export const PdfThumb = memo(function PdfThumb({ doc, page, width = 140, rotation = 0, className }: { doc: PDFDocumentProxy; page: number; width?: number; rotation?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState(1.414);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    let objectUrl: string | null = null;
    (async () => {
      const p = await doc.getPage(page);
      const base = p.getViewport({ scale: 1 });
      const scale = (width * (window.devicePixelRatio || 1)) / base.width;
      const vp = p.getViewport({ scale });
      setRatio(base.height / base.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await p.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
      p.cleanup();
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.8));
      canvas.width = canvas.height = 0;
      if (blob && alive) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    })().catch(() => {});
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visible, doc, page, width]);

  const rot = ((rotation % 360) + 360) % 360;
  const sideways = rot === 90 || rot === 270;
  return (
    <div ref={ref} className={cn("flex items-center justify-center overflow-hidden", className)} style={{ width, height: sideways ? width : width * ratio }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Page ${page}`}
          className="max-w-none bg-white shadow-sm transition-transform"
          style={{ width: sideways ? width / ratio : width, transform: `rotate(${rot}deg)` }}
          draggable={false}
        />
      ) : (
        <div className="h-full w-full animate-pulse rounded bg-surface-3" aria-hidden />
      )}
    </div>
  );
});
