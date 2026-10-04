import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a PDF — page thumbnails appear.", "Click the pages you want, or type ranges like 1-3, 8.", "Select Extract pages to download a new PDF with just those pages."],
  sections: [
    {
      heading: "When to extract pages",
      body: (
        <ul>
          <li>Sending only the relevant pages of a long statement or report</li>
          <li>Pulling a single form or certificate out of a combined scan</li>
          <li>Creating a handout from selected slides</li>
        </ul>
      ),
    },
    {
      heading: "Selecting pages quickly",
      body: (
        <>
          <p>Click thumbnails for a few pages, or type a selection and press Apply. The two stay in sync, so you can type a range and then click to adjust it.</p>
          <ul>
            <li><code>1-3, 8</code> — pages 1, 2, 3 and 8</li>
            <li><code>10-</code> or <code>10-end</code> — page 10 to the last page</li>
            <li><code>-5</code> — pages 1 to 5</li>
          </ul>
          <p>Select all, Select none, Odd pages and Even pages help with long documents. The new PDF downloads as <code>-extracted.pdf</code>, and PDFs up to 300 MB can be opened.</p>
        </>
      ),
    },
    {
      heading: "What stays the same",
      body: (
        <>
          <p>Pages are copied exactly, including text, fonts, images and links — nothing is re-rendered. Your original file isn&apos;t changed. Everything happens in your browser, so confidential documents stay on your device.</p>
          <p>To create several files at once, use <Link href="/pdf/pdf-split">Split PDF</Link>.</p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "Can I change the page order?", a: "Pages are extracted in page-number order. To reorder, extract pages individually and combine them with Merge PDF." },
    { q: "Need several separate files?", a: "Use Split PDF to create multiple files in one go." },
    { q: "What's the difference from Delete pages?", a: "They're mirror images. Extract keeps the pages you select; Delete removes them. Use whichever means fewer clicks." },
    { q: "Is the PDF uploaded?", a: "No. Pages are copied into the new file in your browser." },
    { q: "Can I extract pages from a password-protected PDF?", a: "No. Remove the protection in a PDF reader that knows the password, save a copy, and use that." },
  ],
};

export default content;
