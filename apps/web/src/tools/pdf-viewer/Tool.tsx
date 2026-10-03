"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ChevronLeft, ChevronRight, Maximize, Minus, PanelLeft, Plus, RotateCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Spinner } from "@/components/ui/progress";
import { ToolErrorAlert } from "@/components/tool/ToolErrorAlert";
import { PdfInput } from "@/components/pdf/PdfInput";
import { PdfThumb } from "@/components/pdf/PdfThumb";
import { usePdf } from "@/components/pdf/use-pdf";
import { loadPdfJs } from "@/lib/pdf/pdfjs";
import { cn } from "@/lib/cn";

const Page = memo(function Page({ doc, n, width, rotation, onVisible }: { doc: PDFDocumentProxy; n: number; width: number; rotation: number; onVisible: (n: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(1.414);
  const [near, setNear] = useState(false);

  useEffect(() => {
    let alive = true;
    doc.getPage(n).then((p) => {
      const vp = p.getViewport({ scale: 1, rotation: (p.rotate + rotation) % 360 });
      if (alive) setRatio(vp.height / vp.width);
    });
    return () => {
      alive = false;
    };
  }, [doc, n, rotation]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        setNear(e.isIntersecting);
        if (e.isIntersecting && e.intersectionRatio > 0.3) onVisible(n);
      }
    }, { rootMargin: "600px 0px", threshold: [0, 0.3, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, [n, onVisible]);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    let task: { cancel: () => void } | null = null;
    let textLayer: { cancel: () => void } | null = null;
    (async () => {
      const p = await doc.getPage(n);
      const base = p.getViewport({ scale: 1, rotation: (p.rotate + rotation) % 360 });
      const scale = width / base.width;
      const vp = p.getViewport({ scale, rotation: (p.rotate + rotation) % 360 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const render = p.render({ canvas, canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined });
      task = render;
      await render.promise;
      if (cancelled || !textRef.current) return;
      const { TextLayer } = await loadPdfJs();
      textRef.current.replaceChildren();
      textRef.current.style.setProperty("--total-scale-factor", String(scale));
      const tl = new TextLayer({ textContentSource: p.streamTextContent(), container: textRef.current, viewport: vp });
      textLayer = tl;
      await tl.render();
    })().catch(() => {});
    return () => {
      cancelled = true;
      task?.cancel();
      textLayer?.cancel();
    };
  }, [near, doc, n, width, rotation]);

  return (
    <div ref={wrap} id={`pdf-page-${n}`} data-page={n} className="relative mx-auto bg-white shadow-md" style={{ width, height: width * ratio }}>
      {near ? <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label={`Page ${n}`} /> : null}
      <div ref={textRef} className="pdf-text-layer" />
      <span className="sr-only">Page {n}</span>
    </div>
  );
});

function Viewer({ doc, fileName, onClose }: { doc: PDFDocumentProxy; fileName: string; onClose: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState(800);
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const [rotation, setRotation] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [thumbs, setThumbs] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<number[] | null>(null);
  const [searching, setSearching] = useState(false);
  const total = doc.numPages;

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainer(el.clientWidth));
    ro.observe(el);
    setContainer(el.clientWidth);
    return () => ro.disconnect();
  }, [thumbs]);

  const width = zoom === "fit" ? Math.max(240, Math.min(container - 32, 1100)) : Math.round(600 * zoom);
  const onVisible = useCallback((n: number) => {
    setCurrent(n);
    setPageInput(String(n));
  }, []);
  const goto = (n: number) => {
    const p = Math.min(total, Math.max(1, n));
    document.getElementById(`pdf-page-${p}`)?.scrollIntoView({ block: "start" });
    setCurrent(p);
    setPageInput(String(p));
  };
  const zoomBy = (d: number) => setZoom((z) => Math.min(4, Math.max(0.4, Math.round(((z === "fit" ? width / 600 : z) + d) * 10) / 10)));

  async function search() {
    const term = q.trim().toLowerCase();
    if (!term) return setHits(null);
    setSearching(true);
    const found: number[] = [];
    for (let n = 1; n <= total; n++) {
      const p = await doc.getPage(n);
      const t = await p.getTextContent();
      if (t.items.map((i) => ("str" in i ? i.str : "")).join(" ").toLowerCase().includes(term)) found.push(n);
    }
    setHits(found);
    setSearching(false);
    if (found.length) goto(found[0]);
  }

  return (
    <div className="flex h-[min(85vh,60rem)] min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
        <Button variant="ghost" size="icon-sm" className="hidden md:inline-flex" aria-label="Toggle thumbnails" aria-pressed={thumbs} onClick={() => setThumbs((t) => !t)}><PanelLeft aria-hidden /></Button>
        <Button variant="ghost" size="icon-sm" aria-label="Previous page" disabled={current <= 1} onClick={() => goto(current - 1)}><ChevronLeft aria-hidden /></Button>
        <form onSubmit={(e) => { e.preventDefault(); goto(Number(pageInput) || 1); }} className="flex items-center gap-1 text-sm">
          <Input aria-label="Page number" value={pageInput} onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))} className="h-8 w-12 px-1 text-center tabular-nums" inputMode="numeric" />
          <span className="text-muted">/ {total}</span>
        </form>
        <Button variant="ghost" size="icon-sm" aria-label="Next page" disabled={current >= total} onClick={() => goto(current + 1)}><ChevronRight aria-hidden /></Button>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => zoomBy(-0.2)}><Minus aria-hidden /></Button>
        <span className="w-12 text-center text-xs tabular-nums text-muted">{Math.round((width / 600) * 100)}%</span>
        <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => zoomBy(0.2)}><Plus aria-hidden /></Button>
        <Button variant="ghost" size="sm" onClick={() => setZoom("fit")} aria-pressed={zoom === "fit"}><Maximize aria-hidden /> Fit</Button>
        <Button variant="ghost" size="icon-sm" aria-label="Rotate pages" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateCw aria-hidden /></Button>
        <form className="ml-auto flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); void search(); }}>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            <Input aria-label="Find text" value={q} onChange={(e) => { setQ(e.target.value); setHits(null); }} placeholder="Find" className="h-8 w-32 pl-7 text-sm sm:w-44" />
          </div>
          {searching ? <Spinner label="Searching" /> : hits && <span className="text-xs text-muted" aria-live="polite">{hits.length ? `${hits.length} page${hits.length === 1 ? "" : "s"}` : "No match"}</span>}
        </form>
        <Button variant="ghost" size="icon-sm" aria-label="Close PDF" onClick={onClose}><X aria-hidden /></Button>
      </div>
      {hits && hits.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-1.5 text-xs">
          <span className="text-muted">Found on page:</span>
          {hits.slice(0, 40).map((h) => (
            <button key={h} type="button" onClick={() => goto(h)} className={cn("rounded px-1.5 py-0.5 tabular-nums hover:bg-surface-2", h === current && "bg-brand-soft text-brand-soft-fg")}>{h}</button>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        {thumbs && (
          <nav aria-label="Page thumbnails" className="hidden w-40 shrink-0 overflow-y-auto border-r border-border bg-surface-2 p-2 md:block">
            <ul className="flex flex-col gap-2">
              {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <button type="button" onClick={() => goto(n)} aria-current={n === current} className={cn("flex w-full flex-col items-center gap-1 rounded-lg p-1.5", n === current ? "bg-brand-soft" : "hover:bg-surface-3")}>
                    <PdfThumb doc={doc} page={n} width={100} rotation={rotation} />
                    <span className="text-xs tabular-nums text-muted">{n}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div ref={scroller} className="min-w-0 flex-1 overflow-auto bg-surface-3 p-4" tabIndex={0} aria-label={`${fileName}, ${total} pages`} onKeyDown={(e) => {
          if (e.key === "PageDown") { e.preventDefault(); goto(current + 1); }
          if (e.key === "PageUp") { e.preventDefault(); goto(current - 1); }
        }}>
          <div className="flex flex-col gap-4" style={{ width: Math.max(width, 0) }}>
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
              <Page key={n} doc={doc} n={n} width={width} rotation={rotation} onVisible={onVisible} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PdfViewer() {
  const [file, setFile] = useState<File | null>(null);
  const { doc, error, loading } = usePdf(file);
  if (doc && file) return <Viewer doc={doc} fileName={file.name} onClose={() => setFile(null)} />;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <PdfInput file={file} onFile={setFile} />
      {loading && <Spinner label="Opening PDF" />}
      {error && <ToolErrorAlert error={error} />}
    </div>
  );
}
