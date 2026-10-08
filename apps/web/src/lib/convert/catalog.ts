/**
 * Conversion capability matrix.
 *
 * This is the single source of truth for what Expensico can convert. The universal
 * converter, the /convert/<slug> landing pages, the sitemap and the search index are all
 * derived from it. A conversion that isn't listed here doesn't exist in the UI.
 *
 * Pure data only — implementations are wired up in ./implementations.ts (client side).
 */

import { processorConfig } from "../../config/site";
import type { FormatId } from "./formats";

export type ConversionEngine = "browser" | "server";

/**
 * exact – lossless / structurally faithful
 * high  – reliable, minor differences possible (e.g. lossy image encoding, fonts)
 * basic – useful but simplified (e.g. layout not preserved); always explained to the user
 */
export type ConversionQuality = "exact" | "high" | "basic";

export type ImplId =
  | "pdf-to-image"
  | "pdf-to-text"
  | "pdf-to-html"
  | "pdf-to-docx"
  | "image-to-image"
  | "image-to-pdf"
  | "table-convert"
  | "json-to-xml"
  | "json-to-yaml"
  | "yaml-to-json"
  | "xml-to-json"
  | "docx-to-html"
  | "docx-to-txt"
  | "markdown-to-html"
  | "html-to-txt"
  | "server-office";

export type ConversionOption =
  | { type: "select"; id: string; label: string; options: { value: string; label: string }[]; default: string; hint?: string }
  | { type: "range"; id: string; label: string; min: number; max: number; step: number; default: number; unit?: string; hint?: string }
  | { type: "color"; id: string; label: string; default: string; hint?: string }
  | { type: "text"; id: string; label: string; placeholder?: string; default: string; hint?: string }
  | { type: "checkbox"; id: string; label: string; default: boolean; hint?: string };

export interface Faq {
  q: string;
  a: string;
}

export interface ConversionContent {
  /** Opening paragraph(s) under the converter. */
  intro: string;
  /** What actually happens, step by step, in plain language. */
  how: string[];
  whenToUse: string[];
  limitations: string[];
  faqs: Faq[];
}

export interface ConversionDef {
  slug: string;
  from: FormatId;
  /** Every input format this pipeline accepts (used by the universal converter). */
  accepts: FormatId[];
  to: FormatId;
  impl: ImplId;
  engine: ConversionEngine;
  quality: ConversionQuality;
  /** Short explanation shown next to the quality badge. */
  qualityNote: string;
  multipleInputs?: boolean;
  /** Whether this produces one file per page/sheet (results may be zipped). */
  multipleOutputs?: boolean;
  /** Generate a landing page at /convert/<slug>. */
  landing: boolean;
  title: string;
  description: string;
  keywords: string[];
  options?: ConversionOption[];
  content?: ConversionContent;
  related?: string[];
  /** Also list this converter on another category page (canonical URL stays /convert/<slug>). */
  alsoIn?: ("pdf" | "files")[];
  popular?: boolean;
  addedAt: string;
}

const RASTER_INPUTS: FormatId[] = ["jpg", "png", "webp", "gif", "bmp", "avif", "svg"];

const pdfImageOptions = (format: "jpg" | "png" | "webp"): ConversionOption[] => [
  {
    type: "select",
    id: "dpi",
    label: "Resolution",
    default: "150",
    options: [
      { value: "72", label: "72 DPI — screen, smallest files" },
      { value: "150", label: "150 DPI — balanced (recommended)" },
      { value: "300", label: "300 DPI — print quality, large files" },
    ],
  },
  ...(format === "png"
    ? []
    : [
        {
          type: "range" as const,
          id: "quality",
          label: "Image quality",
          min: 40,
          max: 100,
          step: 1,
          default: format === "jpg" ? 88 : 85,
          unit: "%",
        },
      ]),
  {
    type: "text",
    id: "pages",
    label: "Pages",
    default: "",
    placeholder: "All pages (e.g. 1-3, 5)",
    hint: "Leave empty to convert every page.",
  },
];

const imageQualityOption = (def: number): ConversionOption => ({
  type: "range",
  id: "quality",
  label: "Quality",
  min: 40,
  max: 100,
  step: 1,
  default: def,
  unit: "%",
  hint: "Lower quality gives a smaller file.",
});

const backgroundOption: ConversionOption = {
  type: "color",
  id: "background",
  label: "Background for transparent areas",
  default: "#ffffff",
  hint: "JPG has no transparency, so transparent pixels are filled with this colour.",
};

const CONVERSIONS_RAW: ConversionDef[] = [
  // ───────────────────────── PDF → images ─────────────────────────
  {
    slug: "pdf-to-jpg",
    from: "pdf",
    accepts: ["pdf"],
    to: "jpg",
    impl: "pdf-to-image",
    engine: "browser",
    quality: "high",
    qualityNote: "Pages are rendered exactly as a PDF viewer shows them, then saved as JPG images.",
    multipleOutputs: true,
    landing: true,
    popular: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PDF to JPG Converter",
    description: "Convert PDF pages to high-quality JPG images in your browser. Choose resolution and pages, then download one image or a ZIP. No upload.",
    keywords: ["pdf to jpg", "pdf to jpeg", "pdf to image", "convert pdf to picture", "pdf page to jpg"],
    options: pdfImageOptions("jpg"),
    related: ["pdf-to-png", "pdf-viewer", "jpg-to-pdf", "image-compressor"],
    content: {
      intro:
        "This converter turns each page of a PDF into a JPG image. It is the quickest way to share a single page on WhatsApp or social media, insert a page into a presentation, or upload a document to a form that only accepts images. Everything happens in your browser: the PDF is opened and rendered on your own device and never uploaded.",
      how: [
        "Your browser opens the PDF with PDF.js, the same engine Firefox uses to display PDFs.",
        "Each selected page is drawn onto a canvas at the resolution you choose (72, 150 or 300 DPI).",
        "The canvas is encoded as a JPG at your chosen quality. A white background is used because JPG cannot store transparency.",
        "One page downloads as a single image. Several pages are offered individually or together as a ZIP file.",
      ],
      whenToUse: [
        "Sharing one page of a bill, ticket or certificate in a chat app",
        "Adding a document page to a slide deck or a social post",
        "Uploading to a portal that accepts only JPG/JPEG",
        "Creating thumbnails or previews of a PDF",
      ],
      limitations: [
        "The output is a picture of the page: text is no longer selectable or searchable. Use PDF to Text if you need the words.",
        "JPG is lossy. For pages with small text or sharp line art, PNG gives crisper results.",
        "Very large pages at 300 DPI use a lot of memory; on phones, 150 DPI is more reliable.",
        "Password-protected PDFs must be unlocked first.",
      ],
      faqs: [
        { q: "Is my PDF uploaded to a server?", a: "No. The conversion runs entirely in your browser using JavaScript. The file stays on your device, and closing the tab discards it." },
        { q: "Which resolution should I choose?", a: "150 DPI is a good default for reading on screens and sharing. Choose 300 DPI if you plan to print the image or need to zoom into small text. 72 DPI produces the smallest files." },
        { q: "Can I convert only some pages?", a: "Yes. Enter page numbers and ranges such as 1-3, 7 in the Pages box. Leave it empty to convert every page." },
        { q: "Should I pick JPG or PNG?", a: "JPG gives smaller files and is best for scanned documents and pages with photos. PNG is lossless and keeps text and diagrams perfectly sharp, but files are larger." },
      ],
    },
  },
  {
    slug: "pdf-to-png",
    from: "pdf",
    accepts: ["pdf"],
    to: "png",
    impl: "pdf-to-image",
    engine: "browser",
    quality: "exact",
    qualityNote: "Pages are rendered at the chosen resolution and stored losslessly.",
    multipleOutputs: true,
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PDF to PNG Converter",
    description: "Turn PDF pages into sharp, lossless PNG images. Pick pages and resolution; conversion runs locally in your browser with no upload.",
    keywords: ["pdf to png", "pdf page to png", "convert pdf to png image", "lossless pdf image"],
    options: pdfImageOptions("png"),
    related: ["pdf-to-jpg", "pdf-to-webp", "png-to-jpg", "image-compressor"],
    content: {
      intro:
        "PDF to PNG renders each page of your PDF as a lossless PNG image. Because PNG doesn't introduce compression artefacts, it is the right choice for pages with fine text, tables, charts or diagrams that need to stay perfectly crisp. The PDF is processed on your device and never leaves it.",
      how: [
        "PDF.js parses the document in your browser.",
        "Each requested page is rasterised at 72, 150 or 300 DPI.",
        "Pixels are saved as PNG with lossless compression, so the image is an exact copy of the rendered page.",
      ],
      whenToUse: [
        "Documentation screenshots and slides where text must stay sharp",
        "Diagrams, floor plans or charts you want to annotate in an image editor",
        "Archiving a page as an image without quality loss",
      ],
      limitations: [
        "PNG files are larger than JPG, especially for scanned pages or photos. Use PDF to JPG for those.",
        "Text becomes part of the image and is no longer selectable.",
        "Pages are rendered on a white background, matching how PDF viewers display them.",
      ],
      faqs: [
        { q: "Is PDF to PNG lossless?", a: "The PNG stores the rendered page without any compression loss. The only choice that affects detail is the resolution (DPI) you render at." },
        { q: "Why is the PNG bigger than the PDF?", a: "A PDF stores text as compact font instructions, while a PNG stores every pixel. A full A4 page at 300 DPI is about 2480 × 3508 pixels." },
        { q: "Does it work offline?", a: "Once the page has loaded, the conversion itself needs no network connection because it runs in your browser." },
      ],
    },
  },
  {
    slug: "pdf-to-webp",
    from: "pdf",
    accepts: ["pdf"],
    to: "webp",
    impl: "pdf-to-image",
    engine: "browser",
    quality: "high",
    qualityNote: "Pages are rendered exactly, then encoded as WebP at your chosen quality.",
    multipleOutputs: true,
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PDF to WebP Converter",
    description: "Convert PDF pages to compact WebP images for websites and apps. Adjustable quality and resolution, processed privately in your browser.",
    keywords: ["pdf to webp", "pdf to web image", "convert pdf for website"],
    options: pdfImageOptions("webp"),
    related: ["pdf-to-jpg", "pdf-to-png", "png-to-webp", "image-compressor"],
    content: {
      intro:
        "WebP images are typically a quarter to a third smaller than JPG at the same visual quality, which makes them ideal for publishing PDF pages on a website. This tool renders each page and encodes it as WebP directly in your browser.",
      how: [
        "The PDF is opened locally with PDF.js.",
        "Selected pages are drawn at your chosen DPI.",
        "Your browser's built-in WebP encoder compresses each page at the quality you set.",
      ],
      whenToUse: [
        "Showing brochure or catalogue pages on a website without slowing it down",
        "Creating lightweight previews of documents in a web app",
      ],
      limitations: [
        "WebP encoding depends on your browser. Current Chrome, Edge, Firefox and Safari support it; very old browsers may not.",
        "Some older desktop software can't open WebP files. Use PDF to JPG for maximum compatibility.",
      ],
      faqs: [
        { q: "Are WebP images supported everywhere?", a: "All modern browsers display WebP. Some older image viewers and office apps don't, so JPG remains the safest choice for email attachments." },
        { q: "What quality setting should I use?", a: "Between 75% and 85% is usually indistinguishable from the original on screen while keeping files small." },
      ],
    },
  },

  // ───────────────────────── PDF → text / documents ─────────────────────────
  {
    slug: "pdf-to-text",
    from: "pdf",
    accepts: ["pdf"],
    to: "txt",
    impl: "pdf-to-text",
    engine: "browser",
    quality: "high",
    qualityNote: "Extracts the text layer of digital PDFs. Scanned PDFs (images of text) contain no text to extract.",
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PDF to Text Converter",
    description: "Extract all text from a PDF into a plain TXT file, page by page. Free, fast and private — the PDF is read in your browser, not uploaded.",
    keywords: ["pdf to text", "pdf to txt", "extract text from pdf", "copy text from pdf"],
    options: [
      { type: "checkbox", id: "pageMarkers", label: "Add page separators", default: true, hint: "Inserts a “— Page N —” line between pages." },
    ],
    related: ["pdf-to-html", "pdf-to-docx", "word-counter", "pdf-viewer"],
    content: {
      intro:
        "PDF to Text pulls the words out of a PDF so you can search, edit, translate or count them. It reads the PDF's text layer directly, so the output is the real text, not a guess from an image.",
      how: [
        "PDF.js reads the text objects stored on each page together with their positions.",
        "Text items are grouped into lines by their vertical position and ordered left to right.",
        "Lines are joined into paragraphs and saved as a UTF-8 .txt file, so accented letters, Indian scripts and symbols are preserved.",
      ],
      whenToUse: [
        "Copying a long passage when the PDF viewer selects text awkwardly",
        "Feeding document text into a translation tool, spreadsheet or search index",
        "Counting words in a PDF essay or report",
      ],
      limitations: [
        "Scanned documents are images and contain no text layer; the result will be empty. This needs OCR, which this tool doesn't do.",
        "Multi-column layouts may interleave columns, because PDFs store text by position rather than reading order.",
        "Tables become lines of text separated by spaces; for tabular data consider copying into a spreadsheet.",
      ],
      faqs: [
        { q: "Why is my output empty?", a: "The PDF is most likely a scan or photo of a document. Those pages are images, so there is no text to extract without OCR (optical character recognition)." },
        { q: "Does it keep formatting?", a: "No. A TXT file can't hold fonts, bold or layout. If you need headings and paragraphs in an editable document, try PDF to Word." },
        { q: "Are non-English characters supported?", a: "Yes, as long as the PDF embeds proper Unicode text. The output is UTF-8 encoded." },
      ],
    },
  },
  {
    slug: "pdf-to-html",
    from: "pdf",
    accepts: ["pdf"],
    to: "html",
    impl: "pdf-to-html",
    engine: "browser",
    quality: "basic",
    qualityNote: "Produces clean, readable HTML with one section per page. Visual layout, fonts and images are not reproduced.",
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PDF to HTML Converter",
    description: "Convert a PDF into a clean, readable HTML page with the text organised by page and paragraph. Runs in your browser; nothing is uploaded.",
    keywords: ["pdf to html", "pdf to web page", "convert pdf to html text"],
    related: ["pdf-to-text", "pdf-to-docx", "html-viewer", "html-formatter"],
    content: {
      intro:
        "This tool extracts the text of a PDF and writes it as a simple, standards-compliant HTML document: one section per page, with lines grouped into paragraphs. The result is easy to paste into a CMS, edit or make accessible.",
      how: [
        "Text and positions are read from each page with PDF.js.",
        "Lines are grouped into paragraphs based on the spacing between them; larger text is marked up as headings.",
        "Special characters are escaped and the result is wrapped in a minimal, responsive HTML document.",
      ],
      whenToUse: [
        "Publishing the content of a PDF as an accessible web page",
        "Moving text from a PDF into a website builder or CMS",
      ],
      limitations: [
        "This is a text conversion, not a visual replica: images, columns, colours and exact fonts aren't reproduced.",
        "Scanned PDFs produce empty pages because they contain no text layer.",
      ],
      faqs: [
        { q: "Will the HTML look identical to the PDF?", a: "No. The goal is clean, reflowable text that works on any screen size. For a pixel-perfect copy, convert pages to images instead." },
        { q: "Is the HTML safe to embed?", a: "Yes. All text is escaped and the output contains no scripts." },
      ],
    },
  },
  {
    slug: "pdf-to-docx",
    from: "pdf",
    accepts: ["pdf"],
    to: "docx",
    impl: "pdf-to-docx",
    engine: "browser",
    quality: "basic",
    qualityNote: "Creates an editable Word document with the PDF's text, paragraphs and page breaks. Layout, images and tables are not reproduced.",
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PDF to Word (DOCX) — Editable Text",
    description: "Turn a PDF into an editable Word document containing its text and paragraphs. Honest, text-focused conversion done in your browser.",
    keywords: ["pdf to word", "pdf to docx", "convert pdf to editable word", "pdf to doc"],
    related: ["pdf-to-text", "pdf-to-html", "docx-viewer", "word-counter"],
    content: {
      intro:
        "Need to edit the words in a PDF? This converter creates a Word document (.docx) with the PDF's text arranged into paragraphs, with a page break after each original page. It is deliberately text-focused: reproducing complex PDF layouts as Word documents is unreliable even for desktop software, so we don't pretend to.",
      how: [
        "PDF.js reads each page's text and positions in your browser.",
        "Lines are grouped into paragraphs; noticeably larger text becomes Word headings.",
        "A standard .docx file is generated locally with a page break between original pages.",
      ],
      whenToUse: [
        "Editing or rewriting the text of a letter, essay or report you only have as a PDF",
        "Reusing text from a PDF in a new Word document",
      ],
      limitations: [
        "Images, tables, columns, headers/footers and exact fonts are not carried over.",
        "Scanned PDFs have no text layer and will produce an empty document.",
        "If you need the document to look exactly like the PDF, keep the PDF or convert pages to images.",
      ],
      faqs: [
        { q: "Why doesn't the Word file look like my PDF?", a: "PDF stores positioned characters, not paragraphs and styles. Rebuilding the original layout is guesswork, so this tool focuses on giving you clean, editable text." },
        { q: "Can I open the result in Google Docs or LibreOffice?", a: "Yes. The output is a standard .docx file that Word, Google Docs, LibreOffice and Pages can open." },
      ],
    },
  },

  // ───────────────────────── Images ─────────────────────────
  {
    slug: "jpg-to-png",
    from: "jpg",
    accepts: RASTER_INPUTS,
    to: "png",
    impl: "image-to-image",
    engine: "browser",
    quality: "exact",
    qualityNote: "Pixels are copied losslessly. Camera metadata (EXIF) is not copied.",
    multipleInputs: true,
    landing: true,
    popular: true,
    addedAt: "2026-10-03",
    title: "JPG to PNG Converter",
    description: "Convert JPG/JPEG images to PNG in bulk, right in your browser. Lossless output, no upload, no watermark.",
    keywords: ["jpg to png", "jpeg to png", "convert jpg to png", "image to png"],
    related: ["png-to-jpg", "jpg-to-webp", "image-compressor", "image-resizer"],
    content: {
      intro:
        "Convert one or many JPG photos to PNG. PNG is lossless, so the converted file is a pixel-perfect copy of the decoded JPG and won't lose further quality if you edit and save it again. Images are converted on your device.",
      how: [
        "Each JPG is decoded by your browser.",
        "The image is drawn at its original size, respecting the EXIF rotation so photos appear upright.",
        "The pixels are written as a PNG file with lossless compression.",
      ],
      whenToUse: [
        "Editing an image repeatedly without accumulating JPG artefacts",
        "Uploading to a site or app that only accepts PNG",
        "Preparing an image you will later add transparency to",
      ],
      limitations: [
        "Converting to PNG can't restore detail the JPG compression already removed.",
        "PNG files of photos are usually 2–5× larger than the JPG.",
        "EXIF metadata such as camera model and GPS location is not copied to the PNG.",
      ],
      faqs: [
        { q: "Does converting JPG to PNG improve quality?", a: "No. It preserves the current quality exactly, but it can't add back detail that was lost when the JPG was created." },
        { q: "Can I convert many images at once?", a: "Yes. Select or drop multiple files and download them individually or as a ZIP." },
        { q: "Will the PNG have a transparent background?", a: "No. JPG has no transparency information, so the PNG will be fully opaque." },
      ],
    },
  },
  {
    slug: "png-to-jpg",
    from: "png",
    accepts: RASTER_INPUTS,
    to: "jpg",
    impl: "image-to-image",
    engine: "browser",
    quality: "high",
    qualityNote: "JPG is lossy; at 85–92% quality the difference is rarely visible. Transparency is replaced with a background colour.",
    multipleInputs: true,
    landing: true,
    popular: true,
    addedAt: "2026-10-03",
    title: "PNG to JPG Converter",
    description: "Convert PNG images to smaller JPG files with adjustable quality and background colour for transparent areas. Batch conversion, no upload.",
    keywords: ["png to jpg", "png to jpeg", "convert png to jpg", "reduce png size"],
    options: [imageQualityOption(90), backgroundOption],
    related: ["jpg-to-png", "png-to-webp", "image-compressor", "image-resizer"],
    content: {
      intro:
        "PNG to JPG makes large PNG images — screenshots, exports, scanned photos — dramatically smaller and accepted by virtually every upload form. Choose a quality level, choose the colour that fills transparent areas, and convert in bulk without uploading anything.",
      how: [
        "Your browser decodes each PNG.",
        "Transparent pixels are composited over the background colour you pick (white by default).",
        "The result is encoded as JPG at your chosen quality.",
      ],
      whenToUse: [
        "Meeting a file-size limit on job portals, government forms or email",
        "Sharing photos that were saved as PNG",
        "Reducing the size of image-heavy documents",
      ],
      limitations: [
        "Transparency can't be kept; JPG doesn't support it. Use PNG to WebP if you need small files with transparency.",
        "Text and sharp-edged graphics may show slight artefacts at lower quality settings.",
      ],
      faqs: [
        { q: "What quality should I use?", a: "85–92% keeps photos looking identical while saving a lot of space. Go lower if you must meet a strict size limit." },
        { q: "What happens to transparent backgrounds?", a: "They are filled with the background colour you choose. White is the default; pick another colour to match where the image will be used." },
      ],
    },
  },
  {
    slug: "jpg-to-webp",
    from: "jpg",
    accepts: RASTER_INPUTS,
    to: "webp",
    impl: "image-to-image",
    engine: "browser",
    quality: "high",
    qualityNote: "Lossy WebP at your chosen quality; typically 25–35% smaller than the JPG.",
    multipleInputs: true,
    landing: true,
    addedAt: "2026-10-03",
    title: "JPG to WebP Converter",
    description: "Convert JPG photos to WebP to make websites load faster. Adjustable quality, batch conversion and size comparison — all in your browser.",
    keywords: ["jpg to webp", "jpeg to webp", "convert images to webp", "webp converter"],
    options: [imageQualityOption(82)],
    related: ["png-to-webp", "webp-to-jpg", "image-compressor", "image-resizer"],
    content: {
      intro:
        "WebP delivers the same visual quality as JPG at a noticeably smaller size, which improves page speed and Core Web Vitals. Drop in your JPGs, choose a quality and compare the before/after sizes for every file.",
      how: [
        "Each JPG is decoded locally, honouring its orientation.",
        "The browser's WebP encoder compresses it at your chosen quality.",
        "The new size and percentage saved are shown for every image.",
      ],
      whenToUse: ["Optimising images for a website or online store", "Reducing storage for large photo collections you only view in browsers"],
      limitations: ["Some older apps and email clients can't open WebP.", "Re-encoding a JPG always loses a little information; keep your originals."],
      faqs: [
        { q: "Is WebP better than JPG?", a: "For the web, usually yes: smaller files at equal quality, plus optional transparency. JPG is still more universally supported outside browsers." },
        { q: "My WebP is larger than the JPG. Why?", a: "If the JPG was already heavily compressed, re-encoding at a high quality setting can increase size. Lower the quality slider and compare." },
      ],
    },
  },
  {
    slug: "png-to-webp",
    from: "png",
    accepts: RASTER_INPUTS,
    to: "webp",
    impl: "image-to-image",
    engine: "browser",
    quality: "high",
    qualityNote: "Lossy WebP keeps transparency and is usually far smaller than PNG.",
    multipleInputs: true,
    landing: true,
    addedAt: "2026-10-03",
    title: "PNG to WebP Converter",
    description: "Convert PNG images to WebP while keeping transparency. Much smaller files for the web, converted privately in your browser.",
    keywords: ["png to webp", "convert png to webp", "transparent webp"],
    options: [imageQualityOption(85)],
    related: ["jpg-to-webp", "webp-to-png", "image-compressor"],
    content: {
      intro:
        "PNG to WebP is the easiest win for website performance: WebP keeps the transparent background of logos and UI graphics while cutting file size substantially. Conversion runs locally with your browser's built-in encoder.",
      how: ["Your PNG is decoded with its alpha channel.", "It is re-encoded as WebP at the chosen quality, preserving transparency."],
      whenToUse: ["Logos, icons and illustrations on websites", "Screenshots in documentation sites"],
      limitations: ["WebP at lower quality can soften very fine text in screenshots; use 90%+ for UI captures."],
      faqs: [
        { q: "Does WebP keep transparency?", a: "Yes. WebP supports an alpha channel, so transparent areas of your PNG stay transparent." },
        { q: "Is the conversion lossless?", a: "This tool uses lossy WebP for maximum savings. At 90–100% quality the result is visually identical for most images." },
      ],
    },
  },
  {
    slug: "webp-to-jpg",
    from: "webp",
    accepts: RASTER_INPUTS,
    to: "jpg",
    impl: "image-to-image",
    engine: "browser",
    quality: "high",
    qualityNote: "Saved as JPG at your chosen quality; transparency is filled with a background colour.",
    multipleInputs: true,
    landing: true,
    popular: true,
    addedAt: "2026-10-03",
    title: "WebP to JPG Converter",
    description: "Convert WebP images downloaded from the web into JPG files that open everywhere. Batch convert locally, no upload, no sign-up.",
    keywords: ["webp to jpg", "webp to jpeg", "convert webp", "open webp file"],
    options: [imageQualityOption(90), backgroundOption],
    related: ["webp-to-png", "jpg-to-webp", "image-viewer"],
    content: {
      intro:
        "Saved an image from a website and got a .webp file your app won't open? Convert it to JPG, the most widely supported image format, in a couple of clicks. Works with many files at once.",
      how: ["The WebP is decoded by your browser.", "Transparent areas are filled with the background colour.", "The image is saved as a JPG at your chosen quality."],
      whenToUse: ["Opening web images in older photo editors or office apps", "Uploading to forms that only accept JPG"],
      limitations: ["Transparency isn't kept (JPG doesn't support it) — use WebP to PNG to keep it.", "Animated WebP files are converted using their first frame only."],
      faqs: [
        { q: "Why do websites use WebP?", a: "WebP files are smaller than JPG and PNG, so pages load faster. Browsers support it, but some desktop software still doesn't." },
        { q: "Can I convert animated WebP?", a: "Only the first frame is converted, because JPG can't store animation." },
      ],
    },
  },
  {
    slug: "webp-to-png",
    from: "webp",
    accepts: RASTER_INPUTS,
    to: "png",
    impl: "image-to-image",
    engine: "browser",
    quality: "exact",
    qualityNote: "Decoded pixels, including transparency, are stored losslessly.",
    multipleInputs: true,
    landing: true,
    addedAt: "2026-10-03",
    title: "WebP to PNG Converter",
    description: "Convert WebP images to lossless PNG with transparency intact. Free batch conversion in your browser — files never leave your device.",
    keywords: ["webp to png", "convert webp to png", "webp transparent png"],
    related: ["webp-to-jpg", "png-to-webp", "image-viewer"],
    content: {
      intro: "WebP to PNG converts web images into the universally supported PNG format without losing transparency or adding compression artefacts.",
      how: ["The WebP is decoded by your browser, including its alpha channel.", "Pixels are saved as a lossless PNG."],
      whenToUse: ["Editing web graphics in tools that don't support WebP", "Keeping a transparent logo in a widely compatible format"],
      limitations: ["PNG files are usually larger than the WebP original.", "Animated WebP: only the first frame is converted."],
      faqs: [{ q: "Is any quality lost?", a: "No. PNG is lossless, so the output matches the decoded WebP pixel for pixel." }],
    },
  },
  {
    slug: "svg-to-png",
    from: "svg",
    accepts: ["svg"],
    to: "png",
    impl: "image-to-image",
    engine: "browser",
    quality: "exact",
    qualityNote: "Vector artwork is rendered at the scale you choose and saved losslessly.",
    multipleInputs: true,
    landing: true,
    addedAt: "2026-10-03",
    title: "SVG to PNG Converter",
    description: "Render SVG vector graphics to PNG at 1×, 2×, 4× or 8× scale with transparency preserved. Converted securely in your browser.",
    keywords: ["svg to png", "convert svg to png", "svg to image", "svg export png"],
    options: [
      {
        type: "select",
        id: "scale",
        label: "Scale",
        default: "2",
        options: [
          { value: "1", label: "1× (original size)" },
          { value: "2", label: "2× (retina)" },
          { value: "4", label: "4×" },
          { value: "8", label: "8×" },
        ],
      },
    ],
    related: ["png-to-webp", "image-resizer", "image-viewer"],
    content: {
      intro:
        "SVG files stay sharp at any size, but many apps, slide tools and upload forms need a PNG. This converter renders your SVG at the scale you choose with its transparent background intact.",
      how: [
        "The SVG is loaded as an image by your browser in a restricted mode that doesn't run scripts or load external resources.",
        "It is drawn at the selected scale (based on its width/height or viewBox) and saved as PNG.",
      ],
      whenToUse: ["Using icons and logos in PowerPoint, Word or social media", "Creating high-resolution exports for print"],
      limitations: [
        "External fonts and images referenced by URL are not loaded; embed fonts as paths for exact results.",
        "SVGs without width/height or a viewBox fall back to 300 × 150 px before scaling.",
      ],
      faqs: [{ q: "Is the background transparent?", a: "Yes. Areas of the SVG without fill stay transparent in the PNG." }],
    },
  },
  {
    slug: "jpg-to-pdf",
    from: "jpg",
    accepts: RASTER_INPUTS,
    to: "pdf",
    impl: "image-to-pdf",
    engine: "browser",
    quality: "high",
    qualityNote: "JPGs are embedded without re-compression; other formats are embedded losslessly as PNG.",
    multipleInputs: true,
    landing: true,
    popular: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "JPG to PDF Converter",
    description: "Combine JPG photos and scans into one PDF. Reorder pages, choose A4, Letter or fit-to-image, set margins — all offline in your browser.",
    keywords: ["jpg to pdf", "image to pdf", "photo to pdf", "convert pictures to pdf", "jpeg to pdf"],
    options: [
      {
        type: "select",
        id: "pageSize",
        label: "Page size",
        default: "a4",
        options: [
          { value: "a4", label: "A4" },
          { value: "letter", label: "US Letter" },
          { value: "fit", label: "Fit to image" },
        ],
      },
      {
        type: "select",
        id: "orientation",
        label: "Orientation",
        default: "auto",
        options: [
          { value: "auto", label: "Automatic (per image)" },
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ],
      },
      {
        type: "select",
        id: "margin",
        label: "Margin",
        default: "small",
        options: [
          { value: "none", label: "None" },
          { value: "small", label: "Small (10 mm)" },
          { value: "large", label: "Large (20 mm)" },
        ],
      },
    ],
    related: ["png-to-pdf", "pdf-merge", "pdf-to-jpg", "image-compressor"],
    content: {
      intro:
        "Turn photos of documents, receipts or ID cards into a single, tidy PDF. Add as many images as you like, drag them into the right order, and pick a page size. JPG images are embedded as-is, so there is no extra quality loss.",
      how: [
        "Images are read on your device; JPGs are embedded directly into the PDF without re-encoding.",
        "PNG, WebP and other formats are converted to lossless PNG data first.",
        "Each image is centred on its own page and scaled to fit within the margins, keeping its aspect ratio.",
      ],
      whenToUse: [
        "Submitting scanned documents to an application portal that requires one PDF",
        "Collecting receipts for an expense claim",
        "Sharing a set of photos as one file",
      ],
      limitations: [
        "Large photos produce large PDFs. Compress or resize images first if there is a size limit.",
        "The PDF contains images, so text is not searchable (no OCR).",
      ],
      faqs: [
        { q: "Can I change the order of pages?", a: "Yes. Use the arrows next to each image to reorder before converting." },
        { q: "Will the images lose quality?", a: "JPG files are embedded byte-for-byte. Other formats are stored losslessly. Only the display size on the page changes." },
        { q: "Is there a limit on the number of images?", a: "There's no fixed limit, but very large batches depend on your device's memory. Batches of 100+ photos work on most laptops." },
      ],
    },
  },
  {
    slug: "png-to-pdf",
    from: "png",
    accepts: RASTER_INPUTS,
    to: "pdf",
    impl: "image-to-pdf",
    engine: "browser",
    quality: "exact",
    qualityNote: "PNG images are embedded losslessly.",
    multipleInputs: true,
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PNG to PDF Converter",
    description: "Convert PNG screenshots and graphics into a PDF document, one image per page, with lossless quality. No upload required.",
    keywords: ["png to pdf", "screenshot to pdf", "convert png to pdf"],
    options: [
      {
        type: "select",
        id: "pageSize",
        label: "Page size",
        default: "fit",
        options: [
          { value: "fit", label: "Fit to image" },
          { value: "a4", label: "A4" },
          { value: "letter", label: "US Letter" },
        ],
      },
      {
        type: "select",
        id: "orientation",
        label: "Orientation",
        default: "auto",
        options: [
          { value: "auto", label: "Automatic (per image)" },
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ],
      },
      {
        type: "select",
        id: "margin",
        label: "Margin",
        default: "none",
        options: [
          { value: "none", label: "None" },
          { value: "small", label: "Small (10 mm)" },
          { value: "large", label: "Large (20 mm)" },
        ],
      },
    ],
    related: ["jpg-to-pdf", "pdf-merge", "pdf-to-png"],
    content: {
      intro:
        "PNG to PDF packages screenshots, diagrams and other graphics into a PDF without any quality loss. “Fit to image” makes each page exactly the size of its image — ideal for sharing slides or UI mock-ups.",
      how: ["PNG data is embedded losslessly in the PDF.", "Each image gets its own page, sized to the image or to A4/Letter with margins."],
      whenToUse: ["Sending a set of screenshots as one document", "Archiving diagrams or charts as PDF"],
      limitations: ["Transparent areas appear white in most PDF viewers.", "Text in images is not searchable."],
      faqs: [{ q: "Is PNG to PDF lossless?", a: "Yes. PNG pixel data is embedded in the PDF without recompression." }],
    },
  },

  // ───────────────────────── Spreadsheets & tabular data ─────────────────────────
  {
    slug: "csv-to-json",
    from: "csv",
    accepts: ["csv", "tsv"],
    to: "json",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "Every row and value is preserved. Numbers and booleans can optionally be typed.",
    landing: true,
    popular: true,
    addedAt: "2026-10-03",
    title: "CSV to JSON Converter",
    description: "Convert CSV files to JSON arrays of objects using the header row as keys. Handles quotes, commas in values and Unicode. Runs locally.",
    keywords: ["csv to json", "convert csv to json", "csv to json array", "spreadsheet to json"],
    options: [
      { type: "checkbox", id: "header", label: "First row contains column names", default: true },
      { type: "checkbox", id: "typed", label: "Convert numbers and true/false to JSON types", default: true, hint: "Leading zeros (e.g. PIN codes, phone numbers) are always kept as text." },
      {
        type: "select",
        id: "indent",
        label: "Output formatting",
        default: "2",
        options: [
          { value: "2", label: "Pretty (2 spaces)" },
          { value: "4", label: "Pretty (4 spaces)" },
          { value: "0", label: "Minified" },
        ],
      },
    ],
    related: ["json-to-csv", "csv-viewer", "json-formatter", "csv-to-xlsx"],
    content: {
      intro:
        "CSV to JSON turns a spreadsheet export into data your code or API can consume directly. With a header row, each line becomes an object whose keys are the column names; without one, each line becomes an array.",
      how: [
        "The file is parsed with a standards-compliant (RFC 4180) CSV parser that understands quoted fields, embedded commas, escaped quotes and line breaks inside values.",
        "The delimiter (comma, semicolon, tab or pipe) is detected automatically.",
        "Optionally, values that are clearly numbers or booleans become JSON numbers and booleans. Values like 007 or +91… stay as strings so nothing is silently changed.",
      ],
      whenToUse: ["Importing spreadsheet data into a JavaScript app or API", "Creating fixtures and mock data for tests", "Converting exports from banks, CRMs or e-commerce platforms"],
      limitations: [
        "Duplicate column names are made unique by appending _2, _3 so no data is overwritten.",
        "Very large files (hundreds of MB) may exceed browser memory.",
      ],
      faqs: [
        { q: "What if a value contains a comma?", a: "Properly quoted values like \"Mumbai, India\" are handled correctly. Unquoted commas inside a value make the file malformed, and the converter reports the affected rows." },
        { q: "Can I keep everything as strings?", a: "Yes. Untick “Convert numbers and true/false” to output every value exactly as written." },
        { q: "Does it support semicolon-separated files?", a: "Yes. The delimiter is detected automatically, so European-style CSVs with semicolons work too." },
      ],
    },
  },
  {
    slug: "csv-to-xlsx",
    from: "csv",
    accepts: ["csv", "tsv"],
    to: "xlsx",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "All rows and columns are written to a single Excel sheet; numbers stay numeric.",
    landing: true,
    popular: true,
    addedAt: "2026-10-03",
    title: "CSV to Excel (XLSX) Converter",
    description: "Convert CSV to a proper Excel XLSX workbook with numbers, dates as text and leading zeros preserved. Fast, private, in-browser.",
    keywords: ["csv to xlsx", "csv to excel", "convert csv to excel", "open csv in excel correctly"],
    options: [{ type: "checkbox", id: "header", label: "First row contains column names", default: true }],
    related: ["xlsx-to-csv", "csv-viewer", "excel-viewer", "csv-to-json"],
    content: {
      intro:
        "Opening a CSV directly in Excel can mangle data: leading zeros vanish from PIN codes and phone numbers, long IDs turn into scientific notation, and Unicode text can appear garbled. Converting to XLSX here avoids those problems because each cell's type is set deliberately.",
      how: [
        "The CSV is parsed in your browser with automatic delimiter detection.",
        "Plain numbers become numeric cells. Values with leading zeros, more than 15 digits or a leading + are stored as text so they are never altered.",
        "A standard .xlsx workbook is generated locally, with column widths sized to fit the data.",
      ],
      whenToUse: ["Sharing data with colleagues who work in Excel", "Preserving IDs, account numbers and PIN codes exactly", "Adding formatting or formulas to exported data"],
      limitations: ["CSV has no formatting, so the workbook uses default styling.", "Dates are kept as text to avoid regional misinterpretation (e.g. 03/04 as March or April)."],
      faqs: [
        { q: "Why not just open the CSV in Excel?", a: "Excel guesses data types when opening CSV and can permanently drop leading zeros or round long numbers. Converting first keeps your data intact." },
        { q: "Will it work with Google Sheets and LibreOffice?", a: "Yes. XLSX is supported by Google Sheets, LibreOffice Calc, Numbers and Excel." },
      ],
    },
  },
  {
    slug: "csv-to-html",
    from: "csv",
    accepts: ["csv", "tsv"],
    to: "html",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "Produces a standards-compliant HTML table; all values are escaped.",
    landing: true,
    addedAt: "2026-10-03",
    title: "CSV to HTML Table Converter",
    description: "Convert CSV data into a clean, accessible HTML table you can paste into a website or email. All values are safely escaped.",
    keywords: ["csv to html", "csv to html table", "convert csv to table"],
    options: [
      { type: "checkbox", id: "header", label: "First row contains column names", default: true },
      { type: "checkbox", id: "fullDocument", label: "Complete HTML page with basic styling", default: true, hint: "Untick to get just the <table> element." },
    ],
    related: ["csv-viewer", "csv-to-json", "html-formatter", "xlsx-to-html"],
    content: {
      intro: "Generate an HTML table from CSV for blogs, documentation, intranet pages or HTML emails. Header rows use proper <th> cells with scope attributes for accessibility.",
      how: ["The CSV is parsed with full quote handling.", "Each value is HTML-escaped so characters like < and & display correctly and can't inject markup.", "You get either a full page with light styling or just the table markup."],
      whenToUse: ["Publishing a price list or schedule on a website", "Embedding data in documentation"],
      limitations: ["Formatting such as colours or merged cells isn't part of CSV, so the table is plain."],
      faqs: [{ q: "Is the output safe to paste into my site?", a: "Yes. Every value is escaped, so the table can't contain scripts or broken markup." }],
    },
  },
  {
    slug: "csv-to-txt",
    from: "csv",
    accepts: ["csv", "tsv"],
    to: "txt",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "All values are written as an aligned plain-text table.",
    landing: true,
    addedAt: "2026-10-03",
    title: "CSV to Text Table Converter",
    description: "Turn CSV into a neatly aligned plain-text table for emails, terminals, code comments and README files. Converted in your browser.",
    keywords: ["csv to txt", "csv to text", "csv to ascii table", "csv to plain text table"],
    options: [
      {
        type: "select",
        id: "style",
        label: "Table style",
        default: "markdown",
        options: [
          { value: "markdown", label: "Markdown table" },
          { value: "ascii", label: "ASCII box (+---+)" },
          { value: "aligned", label: "Aligned columns (spaces)" },
        ],
      },
      { type: "checkbox", id: "header", label: "First row contains column names", default: true },
    ],
    related: ["csv-viewer", "csv-to-html", "markdown-viewer"],
    content: {
      intro: "Plain text is the one format that displays the same everywhere. This converter pads columns so your CSV reads as a clean table in emails, terminals, code comments or Markdown documents.",
      how: ["The CSV is parsed and column widths are measured using display width (so emoji and wide characters line up as well as possible).", "Rows are padded and joined in the style you choose."],
      whenToUse: ["Pasting data into a GitHub README or issue (Markdown style)", "Sharing a small table in a plain-text email or chat"],
      limitations: ["Very wide tables wrap awkwardly in narrow windows.", "Proportional fonts don't align columns — view the output in a monospaced font."],
      faqs: [{ q: "Which style works on GitHub?", a: "Choose “Markdown table”. GitHub, GitLab and most documentation tools render it as a real table." }],
    },
  },
  {
    slug: "xlsx-to-csv",
    from: "xlsx",
    accepts: ["xlsx", "xls", "ods"],
    to: "csv",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "Cell values are exported as displayed (formula results, not formulas). Each sheet can be exported separately.",
    multipleOutputs: true,
    landing: true,
    popular: true,
    addedAt: "2026-10-03",
    title: "Excel to CSV Converter (XLSX, XLS, ODS)",
    description: "Convert Excel workbooks to CSV, one file per sheet or a single sheet. Supports XLSX, XLS and ODS. Processed locally — no upload.",
    keywords: ["xlsx to csv", "excel to csv", "xls to csv", "convert excel to csv", "ods to csv"],
    options: [
      {
        type: "select",
        id: "sheets",
        label: "Sheets",
        default: "all",
        options: [
          { value: "all", label: "All sheets (one CSV each)" },
          { value: "first", label: "First sheet only" },
        ],
      },
      {
        type: "select",
        id: "delimiter",
        label: "Delimiter",
        default: ",",
        options: [
          { value: ",", label: "Comma (,)" },
          { value: ";", label: "Semicolon (;)" },
          { value: "\t", label: "Tab" },
        ],
      },
      { type: "checkbox", id: "bom", label: "Add UTF-8 BOM (helps Excel open Unicode correctly)", default: true },
    ],
    related: ["csv-to-xlsx", "excel-viewer", "xlsx-to-json", "csv-viewer"],
    content: {
      intro:
        "Export spreadsheet data to CSV for databases, accounting software, CRMs or scripts. Every sheet in the workbook can be exported, and the values match what you see in Excel — including formula results and formatted dates.",
      how: [
        "The workbook is read in your browser with SheetJS, which supports XLSX, XLSM, XLS and ODS.",
        "Each sheet's cell values are written as CSV using the displayed (formatted) value, so dates and percentages look as they do in Excel.",
        "Values containing the delimiter, quotes or line breaks are quoted correctly.",
      ],
      whenToUse: ["Importing Excel data into a database, Tally, Zoho or a CRM", "Processing spreadsheet data with Python, R or command-line tools"],
      limitations: [
        "CSV stores values only: formulas, formatting, charts, comments and merged-cell layout are not exported.",
        "Password-protected workbooks can't be opened.",
      ],
      faqs: [
        { q: "Are formulas kept?", a: "No. CSV can only hold values, so each formula cell is exported as its calculated result." },
        { q: "What about workbooks with several sheets?", a: "Choose “All sheets” to get one CSV per sheet, bundled as a ZIP, or “First sheet only” for a single file." },
        { q: "Why would I add a BOM?", a: "A UTF-8 byte-order mark tells Excel the file is Unicode, so names in Hindi, Tamil or with accents display correctly when you reopen the CSV in Excel." },
      ],
    },
  },
  {
    slug: "xlsx-to-json",
    from: "xlsx",
    accepts: ["xlsx", "xls", "ods"],
    to: "json",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "Each sheet becomes an array of row objects keyed by the header row.",
    landing: true,
    addedAt: "2026-10-03",
    title: "Excel to JSON Converter",
    description: "Convert XLSX, XLS or ODS spreadsheets to JSON, with each sheet as an array of objects keyed by column headers. Private, in-browser conversion.",
    keywords: ["excel to json", "xlsx to json", "convert spreadsheet to json"],
    options: [
      {
        type: "select",
        id: "sheets",
        label: "Sheets",
        default: "all",
        options: [
          { value: "all", label: "All sheets (object keyed by sheet name)" },
          { value: "first", label: "First sheet only (array)" },
        ],
      },
      { type: "checkbox", id: "header", label: "First row contains column names", default: true },
    ],
    related: ["xlsx-to-csv", "csv-to-json", "json-viewer", "excel-viewer"],
    content: {
      intro: "Spreadsheets are where data is maintained; JSON is what applications consume. This converter bridges the two with typed numbers and booleans and every sheet in the workbook.",
      how: ["The workbook is parsed locally with SheetJS.", "The header row provides keys; empty cells become null so every object has the same shape.", "Numbers and booleans keep their types; dates are output as ISO strings (YYYY-MM-DD)."],
      whenToUse: ["Seeding a database or CMS from a spreadsheet", "Turning a content sheet maintained by non-developers into app data"],
      limitations: ["Merged cells are read from their top-left cell only.", "Formulas are exported as their calculated values."],
      faqs: [{ q: "How are dates handled?", a: "Cells formatted as dates are exported as ISO 8601 strings such as 2026-03-31, which every programming language can parse." }],
    },
  },
  {
    slug: "xlsx-to-html",
    from: "xlsx",
    accepts: ["xlsx", "xls", "ods"],
    to: "html",
    impl: "table-convert",
    engine: "browser",
    quality: "high",
    qualityNote: "Values and merged cells are preserved; colours, fonts and charts are not.",
    landing: true,
    addedAt: "2026-10-03",
    title: "Excel to HTML Table Converter",
    description: "Convert Excel sheets into clean HTML tables with merged cells preserved. One section per sheet. Runs in your browser, no upload.",
    keywords: ["excel to html", "xlsx to html", "spreadsheet to html table"],
    related: ["xlsx-to-csv", "csv-to-html", "excel-viewer", "html-formatter"],
    content: {
      intro: "Publish spreadsheet data on the web without screenshots. Each sheet becomes an accessible HTML table, with merged cells kept as rowspan/colspan.",
      how: ["The workbook is parsed in your browser.", "Each sheet is converted to a table using displayed cell values.", "Output is escaped and wrapped in a lightly styled HTML page."],
      whenToUse: ["Publishing a timetable, price list or report on a website", "Emailing a formatted table"],
      limitations: ["Cell colours, fonts, borders, conditional formatting and charts are not reproduced."],
      faqs: [{ q: "Are hidden sheets included?", a: "Yes, every sheet in the workbook is converted. Remove any you don't need from the output." }],
    },
  },
  {
    slug: "xlsx-to-txt",
    from: "xlsx",
    accepts: ["xlsx", "xls", "ods"],
    to: "txt",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "Cell values are written as a tab-separated text file per sheet.",
    landing: true,
    addedAt: "2026-10-03",
    title: "Excel to Text (TXT) Converter",
    description: "Convert Excel worksheets to tab-separated plain text that pastes cleanly into any program. XLSX, XLS and ODS supported, processed locally.",
    keywords: ["excel to txt", "xlsx to txt", "excel to text file", "excel to tab delimited"],
    related: ["xlsx-to-csv", "csv-to-txt", "excel-viewer"],
    content: {
      intro: "Some systems, such as older bank and payroll uploads, expect tab-delimited text files. This converter writes each sheet's values with tabs between columns.",
      how: ["The workbook is opened locally.", "Each row is written as values separated by tab characters, one sheet after another with a sheet heading."],
      whenToUse: ["Uploading to systems that require tab-delimited .txt files", "Pasting spreadsheet data into plain-text editors"],
      limitations: ["Tabs or line breaks inside cells are replaced with spaces so the structure stays valid."],
      faqs: [{ q: "What's the difference from CSV?", a: "The data is the same; only the separator differs. Tabs rarely appear in real data, so tab-delimited files need no quoting." }],
    },
  },
  {
    slug: "xls-to-xlsx",
    from: "xls",
    accepts: ["xls", "ods", "csv"],
    to: "xlsx",
    impl: "table-convert",
    engine: "browser",
    quality: "high",
    qualityNote: "Values, formulas, sheets and number formats are kept; some styling and macros are not.",
    landing: true,
    addedAt: "2026-10-03",
    title: "XLS to XLSX Converter",
    description: "Upgrade legacy Excel 97–2003 XLS files (and ODS) to modern XLSX workbooks with all sheets, values and formulas. Converted privately in your browser.",
    keywords: ["xls to xlsx", "convert xls to xlsx", "old excel to new", "ods to xlsx"],
    related: ["xlsx-to-csv", "excel-viewer", "csv-to-xlsx"],
    content: {
      intro: "Legacy .xls files are limited to 65,536 rows and are increasingly rejected by modern systems. Converting to .xlsx gives you the current Excel format with all sheets intact.",
      how: ["SheetJS reads the binary XLS (or ODS) in your browser.", "Sheets, cell values, formulas and number formats are written to a new XLSX workbook."],
      whenToUse: ["Modernising old archives", "Uploading to tools that only accept .xlsx"],
      limitations: ["Macros (VBA), charts, pivot tables and most cell styling are not carried over.", "Encrypted workbooks can't be read."],
      faqs: [{ q: "Are formulas preserved?", a: "Yes, formulas are copied along with their last calculated values." }],
    },
  },
  {
    slug: "json-to-csv",
    from: "json",
    accepts: ["json"],
    to: "csv",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "Nested objects are flattened to dot-notation columns; arrays of values are joined.",
    landing: true,
    popular: true,
    addedAt: "2026-10-03",
    title: "JSON to CSV Converter",
    description: "Convert JSON arrays to CSV with nested objects flattened into columns like address.city. Handles mixed keys and Unicode, entirely in-browser.",
    keywords: ["json to csv", "convert json to csv", "json to excel", "flatten json"],
    options: [
      {
        type: "select",
        id: "delimiter",
        label: "Delimiter",
        default: ",",
        options: [
          { value: ",", label: "Comma (,)" },
          { value: ";", label: "Semicolon (;)" },
          { value: "\t", label: "Tab" },
        ],
      },
      { type: "checkbox", id: "bom", label: "Add UTF-8 BOM (for Excel)", default: false },
    ],
    related: ["csv-to-json", "json-to-xlsx", "json-viewer", "csv-viewer"],
    content: {
      intro: "Turn API responses and exported JSON into a CSV you can open in any spreadsheet. Objects become rows, keys become columns, and nested objects are flattened so nothing is lost.",
      how: [
        "Your JSON is parsed in the browser. An array of objects becomes rows; a single object becomes one row; if the object wraps an array (for example {\"data\": [...]}), that array is used.",
        "Nested objects are flattened into dot-notation columns such as customer.address.city.",
        "Columns are the union of keys across all rows, so records with missing fields still line up.",
      ],
      whenToUse: ["Analysing API data in Excel or Google Sheets", "Sharing database exports with non-technical colleagues"],
      limitations: ["Arrays of objects inside a record are written as JSON text in a single cell.", "Very deeply nested data produces many columns."],
      faqs: [
        { q: "How are nested arrays handled?", a: "Arrays of simple values are joined with “; ”. Arrays of objects are kept as compact JSON in one cell so no data is lost." },
        { q: "What if records have different keys?", a: "All keys are collected; rows without a key get an empty cell in that column." },
      ],
    },
  },
  {
    slug: "json-to-xlsx",
    from: "json",
    accepts: ["json"],
    to: "xlsx",
    impl: "table-convert",
    engine: "browser",
    quality: "exact",
    qualityNote: "Nested objects are flattened into columns; numbers stay numeric.",
    landing: true,
    addedAt: "2026-10-03",
    title: "JSON to Excel (XLSX) Converter",
    description: "Convert JSON data into an Excel spreadsheet with typed numbers and flattened nested fields. Free and private — runs in your browser.",
    keywords: ["json to excel", "json to xlsx", "convert json to spreadsheet"],
    related: ["json-to-csv", "xlsx-to-json", "excel-viewer"],
    content: {
      intro: "Get JSON data into Excel in one step, with numbers kept as numbers and nested objects spread across readable columns.",
      how: ["The JSON is parsed and flattened just like JSON to CSV.", "An XLSX workbook is generated locally with column widths sized to the data."],
      whenToUse: ["Sharing API data with finance or operations teams", "Building pivot tables from exported records"],
      limitations: ["Excel has a limit of 1,048,576 rows per sheet."],
      faqs: [{ q: "Does it work with nested JSON?", a: "Yes. Nested objects become columns such as address.city; arrays of objects are stored as JSON text in a cell." }],
    },
  },
  {
    slug: "json-to-xml",
    from: "json",
    accepts: ["json"],
    to: "xml",
    impl: "json-to-xml",
    engine: "browser",
    quality: "high",
    qualityNote: "Structure and values are preserved; keys that aren't valid XML names are adjusted.",
    landing: true,
    addedAt: "2026-10-03",
    title: "JSON to XML Converter",
    description: "Convert JSON to well-formed, indented XML. Arrays become repeated elements and invalid tag names are fixed automatically. Runs in your browser.",
    keywords: ["json to xml", "convert json to xml"],
    options: [{ type: "text", id: "root", label: "Root element name", default: "root" }],
    related: ["xml-to-json", "xml-formatter", "json-formatter"],
    content: {
      intro: "Many enterprise systems, SOAP services and feeds still expect XML. This converter maps JSON objects to elements, arrays to repeated elements and escapes every value.",
      how: ["Each object key becomes an element; arrays repeat the element for each item.", "Keys that aren't valid XML names (for example starting with a digit or containing spaces) are converted to valid names.", "Text is escaped and the document is indented for readability."],
      whenToUse: ["Integrating with XML-based APIs", "Generating configuration for XML-based tools"],
      limitations: ["JSON has no concept of attributes, so all data becomes elements.", "null values become empty elements."],
      faqs: [{ q: "How are arrays represented?", a: "An array under the key “item” becomes several <item> elements in a row, which is the most common XML convention." }],
    },
  },
  {
    slug: "xml-to-json",
    from: "xml",
    accepts: ["xml"],
    to: "json",
    impl: "xml-to-json",
    engine: "browser",
    quality: "high",
    qualityNote: "Elements, attributes (prefixed with @) and text are preserved. Comments and processing instructions are dropped.",
    landing: true,
    addedAt: "2026-10-03",
    title: "XML to JSON Converter",
    description: "Convert XML documents, feeds and API responses to JSON. Attributes, repeated elements and text are mapped predictably. Processed locally.",
    keywords: ["xml to json", "convert xml to json", "rss to json"],
    related: ["json-to-xml", "xml-formatter", "json-viewer"],
    content: {
      intro: "XML to JSON converts XML into JSON that is easy to use in JavaScript and modern APIs, using a predictable mapping you can rely on.",
      how: ["The XML is parsed and validated in your browser.", "Attributes become keys prefixed with @, repeated elements become arrays and text content is kept as values."],
      whenToUse: ["Working with RSS/Atom feeds, sitemaps or SOAP responses in JavaScript", "Migrating XML configuration to JSON"],
      limitations: ["Comments, processing instructions and the XML declaration are not part of the JSON output.", "Mixed content (text interleaved with elements) is simplified."],
      faqs: [{ q: "What happens with invalid XML?", a: "You'll see an error with the line number of the problem so you can fix it." }],
    },
  },
  {
    slug: "json-to-yaml",
    from: "json",
    accepts: ["json"],
    to: "yaml",
    impl: "json-to-yaml",
    engine: "browser",
    quality: "exact",
    qualityNote: "JSON is a subset of YAML, so every value converts exactly.",
    landing: true,
    addedAt: "2026-10-03",
    title: "JSON to YAML Converter",
    description: "Convert JSON to clean, readable YAML for Kubernetes, Docker Compose and CI configs. Exact conversion, done privately in your browser.",
    keywords: ["json to yaml", "convert json to yml"],
    related: ["yaml-to-json", "yaml-validator", "json-formatter"],
    content: {
      intro: "YAML is easier to read and edit by hand than JSON, which is why most configuration tools use it. This converter produces idiomatic YAML from any JSON.",
      how: ["The JSON is parsed and re-serialised as YAML with two-space indentation.", "Strings that YAML could misread (like yes, no, on or 08) are quoted automatically."],
      whenToUse: ["Writing Kubernetes manifests, GitHub Actions or Docker Compose files from JSON examples"],
      limitations: ["Key order is preserved, but comments can't exist in JSON so none are generated."],
      faqs: [{ q: "Is the conversion lossless?", a: "Yes. JSON is valid YAML 1.2, and converting back with YAML to JSON gives the same data." }],
    },
  },
  {
    slug: "yaml-to-json",
    from: "yaml",
    accepts: ["yaml"],
    to: "json",
    impl: "yaml-to-json",
    engine: "browser",
    quality: "exact",
    qualityNote: "Data is preserved exactly. YAML comments are not part of JSON.",
    landing: true,
    addedAt: "2026-10-03",
    title: "YAML to JSON Converter",
    description: "Convert YAML configuration to formatted JSON, with clear error messages for invalid YAML. Supports multi-document files. Runs locally.",
    keywords: ["yaml to json", "yml to json", "convert yaml"],
    related: ["json-to-yaml", "yaml-validator", "json-formatter"],
    content: {
      intro: "Convert YAML files to JSON for APIs, scripts and tools that don't understand YAML. Multi-document YAML (separated by ---) becomes a JSON array.",
      how: ["The YAML is parsed with a YAML 1.2 parser in your browser.", "Anchors and aliases are resolved, and the data is written as indented JSON."],
      whenToUse: ["Feeding configuration into JSON-only tools", "Debugging how a YAML file is actually interpreted"],
      limitations: ["Comments are dropped because JSON doesn't support them.", "Custom YAML tags are not supported."],
      faqs: [{ q: "Why does my YAML fail to parse?", a: "The most common causes are tabs used for indentation and inconsistent indentation levels. The error message shows the line and column." }],
    },
  },

  // ───────────────────────── Documents ─────────────────────────
  {
    slug: "docx-to-html",
    from: "docx",
    accepts: ["docx"],
    to: "html",
    impl: "docx-to-html",
    engine: "browser",
    quality: "high",
    qualityNote: "Headings, paragraphs, lists, tables, links and images are converted to clean semantic HTML. Exact fonts and page layout are not.",
    landing: true,
    addedAt: "2026-10-03",
    title: "Word (DOCX) to HTML Converter",
    description: "Convert Word documents to clean, semantic HTML with headings, lists, tables and images. Ideal for CMS publishing. Processed in your browser.",
    keywords: ["docx to html", "word to html", "convert word document to html", "word to web page"],
    options: [{ type: "checkbox", id: "embedImages", label: "Embed images in the HTML", default: true, hint: "Images are included as data URLs so the file is self-contained." }],
    related: ["docx-to-text", "docx-viewer", "html-formatter", "markdown-to-html"],
    content: {
      intro:
        "Copying from Word into a website editor drags along hidden formatting. This converter produces clean, semantic HTML instead — real headings, lists and tables — so the content looks right with your site's styles.",
      how: ["The DOCX is read in your browser with Mammoth, which maps Word styles (Heading 1, List Paragraph…) to HTML elements.", "Inline formatting such as bold, italic and links is kept; visual-only formatting is dropped.", "The output is sanitised to remove anything unsafe."],
      whenToUse: ["Publishing Word documents on WordPress, Ghost or any CMS", "Creating accessible web versions of documents"],
      limitations: ["Fonts, colours, text boxes, headers/footers and page layout are intentionally not reproduced.", "Legacy .doc files aren't supported in the browser."],
      faqs: [{ q: "Why does the HTML look plainer than my document?", a: "The converter keeps the structure (headings, lists, tables) and drops visual styling so the content fits into your website's design." }],
    },
  },
  {
    slug: "docx-to-text",
    from: "docx",
    accepts: ["docx"],
    to: "txt",
    impl: "docx-to-txt",
    engine: "browser",
    quality: "high",
    qualityNote: "All body text is extracted with paragraph breaks.",
    landing: true,
    addedAt: "2026-10-03",
    title: "Word (DOCX) to Text Converter",
    description: "Extract plain text from Word DOCX documents with paragraph breaks preserved. Fast, private conversion in your browser.",
    keywords: ["docx to txt", "word to text", "extract text from word"],
    related: ["docx-to-html", "word-counter", "docx-viewer"],
    content: {
      intro: "Get the raw text of a Word document for word counts, translation, plain-text email or pasting into systems that strip formatting.",
      how: ["Mammoth reads the document body locally.", "Paragraphs are separated by blank lines and saved as UTF-8 text."],
      whenToUse: ["Counting words or characters in a document", "Pasting content into forms that reject rich text"],
      limitations: ["Text inside headers, footers, footnotes and text boxes may not be included."],
      faqs: [{ q: "Does it support .doc files?", a: "No. Legacy .doc files use a different binary format. Open and re-save them as .docx first." }],
    },
  },
  {
    slug: "markdown-to-html",
    from: "md",
    accepts: ["md", "txt"],
    to: "html",
    impl: "markdown-to-html",
    engine: "browser",
    quality: "exact",
    qualityNote: "GitHub-flavoured Markdown is converted to sanitised HTML.",
    landing: true,
    addedAt: "2026-10-03",
    title: "Markdown to HTML Converter",
    description: "Convert Markdown (including GitHub-flavoured tables and task lists) to clean HTML. Output is sanitised and ready to publish.",
    keywords: ["markdown to html", "md to html", "convert markdown"],
    options: [{ type: "checkbox", id: "fullDocument", label: "Complete HTML page with readable styling", default: true }],
    related: ["markdown-editor", "markdown-viewer", "html-formatter"],
    content: {
      intro: "Turn Markdown READMEs, notes and documentation into HTML you can publish or email. Supports GitHub-flavoured Markdown: tables, task lists, strikethrough and fenced code blocks.",
      how: ["Markdown is parsed with the marked library.", "The resulting HTML is sanitised with DOMPurify to remove scripts and unsafe attributes."],
      whenToUse: ["Publishing documentation", "Converting notes into an HTML email or web page"],
      limitations: ["Raw HTML embedded in your Markdown is sanitised; scripts and event handlers are removed."],
      faqs: [{ q: "Which Markdown flavour is supported?", a: "CommonMark plus GitHub extensions such as tables, task lists and strikethrough." }],
    },
  },
  {
    slug: "html-to-text",
    from: "html",
    accepts: ["html"],
    to: "txt",
    impl: "html-to-txt",
    engine: "browser",
    quality: "high",
    qualityNote: "Visible text is extracted with line breaks for blocks; scripts and styles are ignored.",
    landing: true,
    addedAt: "2026-10-03",
    title: "HTML to Text Converter",
    description: "Strip HTML tags and extract readable plain text from web pages and HTML emails, keeping paragraph and list structure. Runs in your browser.",
    keywords: ["html to text", "strip html tags", "html to plain text"],
    related: ["html-viewer", "html-formatter", "word-counter"],
    content: {
      intro: "Remove all markup from an HTML file and keep the readable text, with paragraphs, headings and list items on their own lines.",
      how: ["The HTML is parsed into an inert document (nothing is executed or loaded).", "Scripts, styles and hidden elements are skipped, and block elements become line breaks."],
      whenToUse: ["Creating a plain-text version of an HTML email", "Counting words in a web page"],
      limitations: ["Text generated by JavaScript at runtime isn't present in the HTML file and can't be extracted."],
      faqs: [{ q: "Is it safe to convert untrusted HTML?", a: "Yes. The HTML is parsed without running scripts or loading images." }],
    },
  },

  // ───────────────────────── Server-side (LibreOffice) ─────────────────────────
  {
    slug: "docx-to-pdf",
    from: "docx",
    accepts: ["docx", "doc", "odt", "rtf"],
    to: "pdf",
    impl: "server-office",
    engine: "server",
    quality: "high",
    qualityNote: "Converted with LibreOffice. Layout is usually faithful; documents using fonts we don't have may reflow slightly.",
    landing: true,
    popular: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "Word to PDF Converter",
    description: "Convert Word DOCX, DOC, ODT and RTF documents to PDF with layout preserved. Files are processed securely and deleted immediately after conversion.",
    keywords: ["word to pdf", "docx to pdf", "doc to pdf", "convert word to pdf", "odt to pdf"],
    related: ["pdf-compress", "pdf-merge", "docx-viewer"],
    content: {
      intro:
        "Turn Word documents into PDFs that look the same on every device. Accurate Word-to-PDF conversion needs a full office engine, so this tool sends your file over an encrypted connection to our conversion server, converts it with LibreOffice and deletes it straight away.",
      how: [
        "Your document is uploaded over HTTPS to our conversion service.",
        "LibreOffice converts it to PDF in an isolated, temporary folder. Macros are never run.",
        "The PDF is sent back to your browser, and the uploaded document and the PDF are deleted from the server immediately afterwards.",
      ],
      whenToUse: ["Sending CVs, letters and reports that must look identical for the recipient", "Submitting documents to portals that only accept PDF"],
      limitations: ["Documents that use uncommon fonts may reflow slightly if the font isn't installed on our server.", "Password-protected documents can't be converted."],
      faqs: [
        { q: "Is my document stored?", a: "No. It's processed in a temporary folder and deleted as soon as the PDF is returned; a background cleanup also removes anything older than 15 minutes in case of errors." },
        { q: "Why does this tool upload my file when others don't?", a: "Rendering Word layouts faithfully needs a full office suite, which can't run in a browser. We tell you clearly whenever a tool uploads files." },
      ],
    },
  },
  {
    slug: "xlsx-to-pdf",
    from: "xlsx",
    accepts: ["xlsx", "xls", "ods"],
    to: "pdf",
    impl: "server-office",
    engine: "server",
    quality: "high",
    qualityNote: "Converted with LibreOffice using the workbook's print settings.",
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "Excel to PDF Converter",
    description: "Convert Excel spreadsheets to PDF using the workbook's print areas and page setup. Processed securely and deleted right after conversion.",
    keywords: ["excel to pdf", "xlsx to pdf", "convert spreadsheet to pdf"],
    related: ["xlsx-to-html", "excel-viewer", "pdf-merge"],
    content: {
      intro: "Create a PDF from an Excel workbook for invoices, reports and statements. The conversion uses LibreOffice on our server and respects the print areas and page setup saved in the workbook.",
      how: ["The workbook is uploaded over HTTPS.", "LibreOffice prints every sheet to PDF in an isolated temporary folder.", "The PDF is returned and both files are deleted immediately."],
      whenToUse: ["Sharing invoices or statements that must not be edited", "Printing reports consistently"],
      limitations: ["Very wide sheets are split across pages according to the workbook's page setup. Set a print area or ‘fit to width’ in Excel for best results."],
      faqs: [{ q: "Which sheets are included?", a: "All visible sheets are included, in workbook order." }],
    },
  },
  {
    slug: "pptx-to-pdf",
    from: "pptx",
    accepts: ["pptx", "ppt", "odp"],
    to: "pdf",
    impl: "server-office",
    engine: "server",
    quality: "high",
    qualityNote: "Each slide becomes a PDF page. Animations and embedded media are not included.",
    landing: true,
    alsoIn: ["pdf"],
    addedAt: "2026-10-03",
    title: "PowerPoint to PDF Converter",
    description: "Convert PowerPoint PPTX, PPT and ODP presentations to PDF, one slide per page. Files are deleted immediately after secure conversion.",
    keywords: ["ppt to pdf", "pptx to pdf", "powerpoint to pdf", "convert slides to pdf"],
    related: ["pdf-compress", "pdf-to-jpg", "pdf-merge"],
    content: {
      intro: "Share presentations as PDFs that open everywhere, with every slide on its own page. The conversion runs on our LibreOffice server and files are deleted straight after.",
      how: ["The presentation is uploaded over HTTPS.", "LibreOffice exports each slide to a PDF page.", "The result is returned and all files are deleted from the server."],
      whenToUse: ["Sending slides to people without PowerPoint", "Uploading presentations to learning platforms"],
      limitations: ["Animations, transitions, audio and video are not part of a PDF.", "Unusual fonts may be substituted."],
      faqs: [{ q: "Are speaker notes included?", a: "No, only the slides are exported." }],
    },
  },
];

/** Server conversions are only offered when the processor service is configured. */
export function isConversionAvailable(def: ConversionDef): boolean {
  return def.engine === "browser" || processorConfig.enabled;
}

export const CONVERSIONS: ConversionDef[] = CONVERSIONS_RAW;

export function getConversion(slug: string): ConversionDef | undefined {
  return CONVERSIONS.find((c) => c.slug === slug);
}

/** Conversions that get a /convert/<slug> landing page right now. */
export function landingConversions(): ConversionDef[] {
  return CONVERSIONS.filter((c) => c.landing && isConversionAvailable(c));
}

export interface TargetOption {
  to: FormatId;
  def: ConversionDef;
  available: boolean;
}

/** Output formats offered for a detected input format, one entry per target. */
export function targetsFor(input: FormatId): TargetOption[] {
  const seen = new Map<FormatId, TargetOption>();
  for (const def of CONVERSIONS) {
    if (!def.accepts.includes(input) || def.to === input) continue;
    const existing = seen.get(def.to);
    const available = isConversionAvailable(def);
    // Prefer an available converter; among those, prefer the one whose primary input matches.
    if (!existing || (!existing.available && available) || (existing.available === available && def.from === input && existing.def.from !== input)) {
      seen.set(def.to, { to: def.to, def, available });
    }
  }
  // Only conversions that work right now; server-only ones appear once the processor is configured.
  return [...seen.values()].filter((t) => t.available);
}

/** Every input format that has at least one conversion. */
export function convertibleInputs(): FormatId[] {
  return [...new Set(CONVERSIONS.flatMap((c) => c.accepts))];
}

