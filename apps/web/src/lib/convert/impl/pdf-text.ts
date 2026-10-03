import type { PDFDocumentProxy } from "pdfjs-dist";
import { ToolError } from "@/lib/files/errors";
import { stripExtension } from "@/lib/format";
import { openPdfFile } from "@/lib/pdf/pdfjs";
import { escapeHtml, itemsToLines, linesToBlocks, type Block, type RawTextItem } from "@/lib/pdf/text-layout";
import type { BrowserImplementation, ConversionInput } from "@/lib/processing/types";

export interface ExtractedPage {
  number: number;
  blocks: Block[];
}

export async function extractPages(doc: PDFDocumentProxy, input: Pick<ConversionInput, "signal" | "onProgress">): Promise<ExtractedPage[]> {
  const pages: ExtractedPage[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    if (input.signal.aborted) throw new ToolError("cancelled");
    input.onProgress({ value: (n - 1) / doc.numPages, label: `Reading page ${n} of ${doc.numPages}…` });
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const items = content.items.filter((it): it is RawTextItem & typeof it => "str" in it) as unknown as RawTextItem[];
    pages.push({ number: n, blocks: linesToBlocks(itemsToLines(items)) });
    page.cleanup();
  }
  return pages;
}

function emptyWarning(pages: ExtractedPage[]): string[] {
  const empty = pages.filter((p) => p.blocks.length === 0).map((p) => p.number);
  if (empty.length === pages.length) {
    throw new ToolError("invalid-format", "This PDF has no text layer — it's probably a scan or a photo of a document. Extracting text from images requires OCR, which this tool doesn't do.", {
      title: "No text found in this PDF",
      hint: "You can still convert the pages to images with PDF to JPG.",
    });
  }
  if (empty.length) return [`${empty.length === 1 ? "Page" : "Pages"} ${empty.join(", ")} contained no extractable text (likely images or scans).`];
  return [];
}

async function withPdf<T>(input: ConversionInput, fn: (doc: PDFDocumentProxy) => Promise<T>): Promise<T> {
  input.onProgress({ label: "Opening PDF…" });
  const doc = await openPdfFile(input.files[0]);
  try {
    return await fn(doc);
  } finally {
    void doc.loadingTask.destroy();
  }
}

export const pdfToText: BrowserImplementation = async (_def, input) =>
  withPdf(input, async (doc) => {
    const pages = await extractPages(doc, input);
    const warnings = emptyWarning(pages);
    const markers = input.options.pageMarkers !== false;
    const text = pages
      .map((p) => {
        const body = p.blocks.map((b) => b.lines.join("\n")).join("\n\n");
        return markers ? `— Page ${p.number} —\n\n${body}` : body;
      })
      .join("\n\n")
      .trim();
    return {
      files: [{ name: `${stripExtension(input.files[0].name)}.txt`, blob: new Blob([text + "\n"], { type: "text/plain;charset=utf-8" }), preview: "text" }],
      warnings,
    };
  });

export const pdfToHtml: BrowserImplementation = async (_def, input) =>
  withPdf(input, async (doc) => {
    const pages = await extractPages(doc, input);
    const warnings = emptyWarning(pages);
    const title = escapeHtml(stripExtension(input.files[0].name));
    const body = pages
      .map((p) => {
        const inner = p.blocks
          .map((b) => (b.kind === "heading" ? `    <h2>${escapeHtml(b.text)}</h2>` : `    <p>${escapeHtml(b.text)}</p>`))
          .join("\n");
        return `  <section class="page" id="page-${p.number}" aria-label="Page ${p.number}">\n${inner}\n  </section>`;
      })
      .join("\n");
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.6; max-width: 46rem; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  .page + .page { border-top: 1px solid #ddd; margin-top: 2rem; padding-top: 1rem; }
  h2 { line-height: 1.3; }
</style>
</head>
<body>
${body}
</body>
</html>
`;
    return {
      files: [{ name: `${stripExtension(input.files[0].name)}.html`, blob: new Blob([html], { type: "text/html;charset=utf-8" }), preview: "html" }],
      warnings,
    };
  });

export const pdfToDocx: BrowserImplementation = async (_def, input) =>
  withPdf(input, async (doc) => {
    const pages = await extractPages(doc, input);
    const warnings = emptyWarning(pages);
    input.onProgress({ label: "Building Word document…" });
    const { Document, Packer, Paragraph, HeadingLevel, PageBreak, TextRun } = await import("docx");
    const children: InstanceType<typeof Paragraph>[] = [];
    pages.forEach((p, pi) => {
      p.blocks.forEach((b) => {
        children.push(
          b.kind === "heading"
            ? new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_2 })
            : new Paragraph({ children: [new TextRun(b.text)], spacing: { after: 160 } }),
        );
      });
      if (pi < pages.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }));
    });
    const document = new Document({
      creator: "Expensico",
      title: stripExtension(input.files[0].name),
      sections: [{ children }],
    });
    const blob = await Packer.toBlob(document);
    return {
      files: [
        {
          name: `${stripExtension(input.files[0].name)}.docx`,
          blob: new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
          preview: "none",
        },
      ],
      warnings: [...warnings, "Only text and paragraphs were converted. Images, tables and exact layout are not included."],
    };
  });
