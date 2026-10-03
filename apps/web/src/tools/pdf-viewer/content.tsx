import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose or drop a PDF.", "Scroll through pages, jump to a page number, zoom in or out, and show thumbnails on larger screens.", "Use Find to see which pages contain a word, and select text to copy it."],
  sections: [
    {
      heading: "A private PDF reader",
      body: <p>The viewer uses PDF.js — the open-source engine inside Firefox — running entirely in your browser. Your PDF isn&apos;t uploaded anywhere, which makes it suitable for bank statements, contracts and medical records. Pages render only as you scroll to them, so even long documents open quickly.</p>,
    },
    {
      heading: "What you can do next",
      body: (
        <ul>
          <li>Turn pages into images with <Link href="/convert/pdf-to-jpg">PDF to JPG</Link>.</li>
          <li>Copy all the text with <Link href="/convert/pdf-to-text">PDF to Text</Link>.</li>
          <li>Check who created the file with the <Link href="/pdf/pdf-metadata">PDF metadata viewer</Link>.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Can I open password-protected PDFs?", a: "Not yet. PDFs that require a password to open will show an error; remove the password in a PDF reader you trust first." },
    { q: "Why can't I select text in some PDFs?", a: "Scanned documents are images of text, so there's nothing to select. That needs OCR." },
    { q: "Does it support forms and annotations?", a: "Pages are displayed with their printed appearance. Filling forms and editing annotations aren't supported." },
  ],
};

export default content;
