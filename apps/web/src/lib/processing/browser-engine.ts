import type { ImplId } from "@/lib/convert/catalog";
import { ToolError } from "@/lib/files/errors";
import type { BrowserImplementation, ProcessingEngine } from "./types";

/** Lazy map so each implementation (and its heavy libraries) loads only when used. */
const IMPLEMENTATIONS: Partial<Record<ImplId, () => Promise<BrowserImplementation>>> = {
  "pdf-to-image": () => import("@/lib/convert/impl/pdf-to-image").then((m) => m.pdfToImage),
  "pdf-to-text": () => import("@/lib/convert/impl/pdf-text").then((m) => m.pdfToText),
  "pdf-to-html": () => import("@/lib/convert/impl/pdf-text").then((m) => m.pdfToHtml),
  "pdf-to-docx": () => import("@/lib/convert/impl/pdf-text").then((m) => m.pdfToDocx),
  "image-to-image": () => import("@/lib/convert/impl/image").then((m) => m.imageToImage),
  "image-to-pdf": () => import("@/lib/convert/impl/image-to-pdf").then((m) => m.imageToPdf),
  "table-convert": () => import("@/lib/convert/impl/table-convert").then((m) => m.tableConvert),
  "json-to-xml": () => import("@/lib/convert/impl/structured").then((m) => m.jsonToXmlImpl),
  "xml-to-json": () => import("@/lib/convert/impl/structured").then((m) => m.xmlToJsonImpl),
  "json-to-yaml": () => import("@/lib/convert/impl/structured").then((m) => m.jsonToYamlImpl),
  "yaml-to-json": () => import("@/lib/convert/impl/structured").then((m) => m.yamlToJsonImpl),
  "docx-to-html": () => import("@/lib/convert/impl/documents").then((m) => m.docxToHtml),
  "docx-to-txt": () => import("@/lib/convert/impl/documents").then((m) => m.docxToTxt),
  "markdown-to-html": () => import("@/lib/convert/impl/documents").then((m) => m.markdownToHtml),
  "html-to-txt": () => import("@/lib/convert/impl/documents").then((m) => m.htmlToTxt),
};

export const browserEngine: ProcessingEngine = {
  kind: "browser",
  async convert(def, input) {
    const load = IMPLEMENTATIONS[def.impl];
    if (!load) throw new ToolError("unsupported", `No browser implementation for ${def.slug}.`);
    const impl = await load();
    return impl(def, input);
  },
};

export function hasBrowserImplementation(impl: ImplId): boolean {
  return impl in IMPLEMENTATIONS;
}
