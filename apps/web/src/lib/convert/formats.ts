/**
 * File format catalogue. Pure data (no browser APIs) so it can be used by routes,
 * the sitemap, the search index and tests.
 */

export type FormatId =
  | "pdf"
  | "jpg"
  | "png"
  | "webp"
  | "gif"
  | "bmp"
  | "avif"
  | "svg"
  | "csv"
  | "tsv"
  | "json"
  | "xml"
  | "yaml"
  | "txt"
  | "html"
  | "md"
  | "xlsx"
  | "xls"
  | "ods"
  | "docx"
  | "doc"
  | "odt"
  | "rtf"
  | "pptx"
  | "ppt"
  | "odp"
  | "zip";

export type FormatFamily = "document" | "image" | "data" | "spreadsheet" | "presentation" | "text" | "archive";

export interface FormatInfo {
  id: FormatId;
  label: string;
  /** Lower-case extensions without the dot. First is the canonical one used for output. */
  extensions: string[];
  mime: string;
  /** Additional MIME types browsers report for this format. */
  altMimes?: string[];
  family: FormatFamily;
  /** One or two factual sentences, used on conversion landing pages. */
  summary: string;
}

export const FORMATS: Record<FormatId, FormatInfo> = {
  pdf: {
    id: "pdf",
    label: "PDF",
    extensions: ["pdf"],
    mime: "application/pdf",
    family: "document",
    summary:
      "PDF (Portable Document Format) stores pages with fixed layout, fonts and images so a document looks the same on every device. It is built for viewing and printing rather than editing.",
  },
  jpg: {
    id: "jpg",
    label: "JPG",
    extensions: ["jpg", "jpeg", "jfif"],
    mime: "image/jpeg",
    altMimes: ["image/pjpeg"],
    family: "image",
    summary:
      "JPG (JPEG) uses lossy compression tuned for photographs. Files are small, but it has no transparency and quality drops slightly each time a JPG is re-saved.",
  },
  png: {
    id: "png",
    label: "PNG",
    extensions: ["png"],
    mime: "image/png",
    family: "image",
    summary:
      "PNG uses lossless compression and supports full transparency. It is ideal for screenshots, logos and graphics with sharp edges, but photos saved as PNG are much larger than JPG.",
  },
  webp: {
    id: "webp",
    label: "WebP",
    extensions: ["webp"],
    mime: "image/webp",
    family: "image",
    summary:
      "WebP is a modern image format from Google that supports both lossy and lossless compression plus transparency. It is typically 25–35% smaller than JPG or PNG at similar quality and is supported by all current browsers.",
  },
  gif: {
    id: "gif",
    label: "GIF",
    extensions: ["gif"],
    mime: "image/gif",
    family: "image",
    summary: "GIF is limited to 256 colours per frame and supports simple animation. It is mostly used for small animations and legacy graphics.",
  },
  bmp: {
    id: "bmp",
    label: "BMP",
    extensions: ["bmp", "dib"],
    mime: "image/bmp",
    altMimes: ["image/x-ms-bmp"],
    family: "image",
    summary: "BMP is an uncompressed Windows bitmap format. Files are very large, so they are usually converted to PNG or JPG for sharing.",
  },
  avif: {
    id: "avif",
    label: "AVIF",
    extensions: ["avif"],
    mime: "image/avif",
    family: "image",
    summary: "AVIF is a newer, highly efficient image format based on the AV1 video codec. It is smaller than WebP at similar quality, but some older software cannot open it.",
  },
  svg: {
    id: "svg",
    label: "SVG",
    extensions: ["svg"],
    mime: "image/svg+xml",
    family: "image",
    summary: "SVG describes graphics as vector shapes in XML, so it stays sharp at any size. Many apps and upload forms still require a raster image such as PNG.",
  },
  csv: {
    id: "csv",
    label: "CSV",
    extensions: ["csv"],
    mime: "text/csv",
    altMimes: ["application/vnd.ms-excel", "text/plain", "application/csv"],
    family: "data",
    summary:
      "CSV (comma-separated values) stores a table as plain text, one row per line. It is supported by almost every spreadsheet, database and programming language, but it has no formatting, formulas or multiple sheets.",
  },
  tsv: {
    id: "tsv",
    label: "TSV",
    extensions: ["tsv", "tab"],
    mime: "text/tab-separated-values",
    altMimes: ["text/plain"],
    family: "data",
    summary: "TSV is like CSV but separates columns with tab characters, which avoids most quoting problems when values contain commas.",
  },
  json: {
    id: "json",
    label: "JSON",
    extensions: ["json"],
    mime: "application/json",
    altMimes: ["text/json", "text/plain"],
    family: "data",
    summary:
      "JSON (JavaScript Object Notation) is the most common format for exchanging structured data between web services. It supports nested objects and arrays, strings, numbers, booleans and null.",
  },
  xml: {
    id: "xml",
    label: "XML",
    extensions: ["xml"],
    mime: "application/xml",
    altMimes: ["text/xml", "text/plain"],
    family: "data",
    summary:
      "XML is a markup language for structured data with elements and attributes. It remains common in enterprise systems, feeds (RSS) and document formats such as DOCX, which is XML inside a ZIP archive.",
  },
  yaml: {
    id: "yaml",
    label: "YAML",
    extensions: ["yaml", "yml"],
    mime: "application/yaml",
    altMimes: ["text/yaml", "application/x-yaml", "text/x-yaml", "text/plain"],
    family: "data",
    summary: "YAML is a human-friendly data format that uses indentation instead of brackets. It is widely used for configuration files (Docker Compose, Kubernetes, CI pipelines).",
  },
  txt: {
    id: "txt",
    label: "TXT",
    extensions: ["txt", "text", "log"],
    mime: "text/plain",
    family: "text",
    summary: "A plain text file contains only characters and line breaks, with no formatting. It opens in any editor on any device.",
  },
  html: {
    id: "html",
    label: "HTML",
    extensions: ["html", "htm"],
    mime: "text/html",
    family: "text",
    summary: "HTML is the markup language of web pages. An HTML file can be opened in any browser and edited with any text editor.",
  },
  md: {
    id: "md",
    label: "Markdown",
    extensions: ["md", "markdown", "mdown"],
    mime: "text/markdown",
    altMimes: ["text/x-markdown", "text/plain"],
    family: "text",
    summary: "Markdown is a lightweight plain-text syntax for formatting (headings, lists, links, code). It is used for READMEs, documentation and notes.",
  },
  xlsx: {
    id: "xlsx",
    label: "Excel (XLSX)",
    extensions: ["xlsx", "xlsm"],
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    altMimes: ["application/vnd.ms-excel.sheet.macroEnabled.12"],
    family: "spreadsheet",
    summary:
      "XLSX is the default Microsoft Excel workbook format since Excel 2007. It can hold multiple sheets, formulas, formatting and charts.",
  },
  xls: {
    id: "xls",
    label: "Excel 97–2003 (XLS)",
    extensions: ["xls"],
    mime: "application/vnd.ms-excel",
    family: "spreadsheet",
    summary: "XLS is the legacy binary Excel format used before 2007. Modern spreadsheet apps can still read it, but XLSX is preferred.",
  },
  ods: {
    id: "ods",
    label: "OpenDocument Spreadsheet (ODS)",
    extensions: ["ods"],
    mime: "application/vnd.oasis.opendocument.spreadsheet",
    family: "spreadsheet",
    summary: "ODS is the open spreadsheet format used by LibreOffice Calc and supported by Excel and Google Sheets.",
  },
  docx: {
    id: "docx",
    label: "Word (DOCX)",
    extensions: ["docx"],
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    family: "document",
    summary: "DOCX is the default Microsoft Word document format. It stores text, styles, tables and images as XML files inside a ZIP archive.",
  },
  doc: {
    id: "doc",
    label: "Word 97–2003 (DOC)",
    extensions: ["doc"],
    mime: "application/msword",
    family: "document",
    summary: "DOC is the legacy binary Microsoft Word format used before 2007.",
  },
  odt: {
    id: "odt",
    label: "OpenDocument Text (ODT)",
    extensions: ["odt"],
    mime: "application/vnd.oasis.opendocument.text",
    family: "document",
    summary: "ODT is the open document format used by LibreOffice Writer and supported by Microsoft Word and Google Docs.",
  },
  rtf: {
    id: "rtf",
    label: "Rich Text (RTF)",
    extensions: ["rtf"],
    mime: "application/rtf",
    altMimes: ["text/rtf"],
    family: "document",
    summary: "RTF is an older cross-platform rich text format with basic formatting support.",
  },
  pptx: {
    id: "pptx",
    label: "PowerPoint (PPTX)",
    extensions: ["pptx"],
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    family: "presentation",
    summary: "PPTX is the default Microsoft PowerPoint presentation format.",
  },
  ppt: {
    id: "ppt",
    label: "PowerPoint 97–2003 (PPT)",
    extensions: ["ppt"],
    mime: "application/vnd.ms-powerpoint",
    family: "presentation",
    summary: "PPT is the legacy binary PowerPoint format.",
  },
  odp: {
    id: "odp",
    label: "OpenDocument Presentation (ODP)",
    extensions: ["odp"],
    mime: "application/vnd.oasis.opendocument.presentation",
    family: "presentation",
    summary: "ODP is the open presentation format used by LibreOffice Impress.",
  },
  zip: {
    id: "zip",
    label: "ZIP",
    extensions: ["zip"],
    mime: "application/zip",
    altMimes: ["application/x-zip-compressed"],
    family: "archive",
    summary: "ZIP bundles and compresses multiple files into one archive.",
  },
};

export function formatFromExtension(ext: string): FormatId | undefined {
  const e = ext.toLowerCase().replace(/^\./, "");
  return (Object.values(FORMATS).find((f) => f.extensions.includes(e)) ?? undefined)?.id;
}

/** Value for <input accept>. */
export function acceptAttribute(formats: FormatId[]): string {
  const parts = new Set<string>();
  for (const id of formats) {
    const f = FORMATS[id];
    f.extensions.forEach((e) => parts.add(`.${e}`));
    parts.add(f.mime);
  }
  return [...parts].join(",");
}

export function formatLabelList(formats: FormatId[]): string {
  return formats.map((f) => FORMATS[f].label.replace(/ \(.*\)$/, "")).join(", ");
}
