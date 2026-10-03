import { ToolError, toToolError } from "@/lib/files/errors";
import { readTextFile } from "@/lib/files/text";
import { stripExtension } from "@/lib/format";
import { htmlToPlainText, markdownToSafeHtml, sanitizeHtml } from "@/lib/html/sanitize";
import { htmlDocument } from "@/lib/convert/table";
import type { BrowserImplementation } from "@/lib/processing/types";

type Mammoth = typeof import("mammoth");

async function loadMammoth(): Promise<Mammoth> {
  const mod = (await import("mammoth")) as unknown as Mammoth & { default?: Mammoth };
  return mod.default ?? mod;
}

async function readDocx(file: File, fn: (m: Mammoth, buf: ArrayBuffer) => Promise<{ value: string; messages: { type: string; message: string }[] }>) {
  const mammoth = await loadMammoth();
  try {
    return await fn(mammoth, await file.arrayBuffer());
  } catch (err) {
    const e = toToolError(err);
    if (e.code === "unknown") throw new ToolError("corrupted", "The Word document couldn't be read. It may be damaged, password-protected or not a real .docx file.");
    throw e;
  }
}

/** DOCX → semantic HTML (body only, sanitised). Shared with the DOCX viewer. */
export async function docxToSafeHtml(file: File, embedImages = true): Promise<{ html: string; warnings: string[] }> {
  const mammoth = await loadMammoth();
  const result = await readDocx(file, (m, buf) =>
    m.convertToHtml(
      { arrayBuffer: buf },
      embedImages ? {} : { convertImage: mammoth.images.imgElement(async () => ({ src: "" })) },
    ),
  );
  const html = await sanitizeHtml(result.value, { allowImages: embedImages });
  const unsupported = result.messages.filter((m) => m.type === "warning").length;
  return { html, warnings: unsupported ? [`${unsupported} formatting element${unsupported === 1 ? " was" : "s were"} simplified because they have no HTML equivalent.`] : [] };
}

export const docxToHtml: BrowserImplementation = async (_def, { files, options, onProgress }) => {
  onProgress({ label: "Reading document…" });
  const { html, warnings } = await docxToSafeHtml(files[0], options.embedImages !== false);
  if (!html.trim()) throw new ToolError("empty", "The document contains no text.");
  const base = stripExtension(files[0].name);
  return { files: [{ name: `${base}.html`, blob: new Blob([htmlDocument(base, html)], { type: "text/html;charset=utf-8" }), preview: "html" }], warnings };
};

export const docxToTxt: BrowserImplementation = async (_def, { files, onProgress }) => {
  onProgress({ label: "Extracting text…" });
  const result = await readDocx(files[0], (m, buf) => m.extractRawText({ arrayBuffer: buf }));
  const text = result.value.replace(/\n{3,}/g, "\n\n").trim();
  if (!text) throw new ToolError("empty", "The document contains no text.");
  return { files: [{ name: `${stripExtension(files[0].name)}.txt`, blob: new Blob([text + "\n"], { type: "text/plain;charset=utf-8" }), preview: "text" }], warnings: [] };
};

export const markdownToHtml: BrowserImplementation = async (_def, { files, options }) => {
  const decoded = await readTextFile(files[0]);
  const body = await markdownToSafeHtml(decoded.text);
  const base = stripExtension(files[0].name);
  const full = options.fullDocument !== false;
  const html = full ? htmlDocument(base, `<article>\n${body}\n</article>`) : body;
  return { files: [{ name: `${base}.html`, blob: new Blob([html], { type: "text/html;charset=utf-8" }), preview: full ? "html" : "text" }], warnings: decoded.warning ? [decoded.warning] : [] };
};

export const htmlToTxt: BrowserImplementation = async (_def, { files }) => {
  const decoded = await readTextFile(files[0]);
  const text = htmlToPlainText(decoded.text);
  if (!text) throw new ToolError("empty", "No visible text was found in this HTML.");
  return { files: [{ name: `${stripExtension(files[0].name)}.txt`, blob: new Blob([text + "\n"], { type: "text/plain;charset=utf-8" }), preview: "text" }], warnings: decoded.warning ? [decoded.warning] : [] };
};
