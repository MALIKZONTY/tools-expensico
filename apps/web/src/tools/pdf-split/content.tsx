import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a PDF.", "Pick how to split it: by ranges, every N pages, or one file per page.", "Select Split, then download the parts individually or as a ZIP."],
  sections: [
    {
      heading: "Writing page ranges",
      body: (
        <ul>
          <li><code>1-3, 4-6</code> creates two files: pages 1–3 and pages 4–6.</li>
          <li><code>5-</code> means page 5 to the end; <code>-3</code> means pages 1 to 3.</li>
          <li>A single number such as <code>7</code> creates a one-page PDF.</li>
          <li>Pages can appear in more than one range if you need them in several files.</li>
        </ul>
      ),
    },
    {
      heading: "Quality",
      body: <p>Splitting copies pages exactly — no re-rendering or compression — so text stays selectable and images keep their original quality. Everything happens in your browser.</p>,
    },
    {
      heading: "Three ways to split",
      body: (
        <ul>
          <li><strong>By page ranges</strong> — you decide exactly which pages go into each file. Best for separating a combined scan into its documents.</li>
          <li><strong>Every N pages</strong> — equal-sized parts, for example every 10 pages, to get under an upload limit on a portal or email.</li>
          <li><strong>One file per page</strong> — every page becomes its own PDF, useful for scanned certificates, receipts or invoices that were scanned together.</li>
        </ul>
      ),
    },
    {
      heading: "File names",
      body: <p>Each part is named after your original file and the pages it contains, such as <code>statement-pages-1-3.pdf</code> or <code>statement-page-7.pdf</code>, so the parts stay in order when you sort them. Download them one at a time, or all together as a ZIP. PDFs up to 300 MB can be opened.</p>,
    },
    { heading: "Combine again later", body: <p>To put parts back together in a different order, use <Link href="/pdf/pdf-merge">Merge PDF</Link>.</p> },
  ],
  faqs: [
    { q: "How is this different from Extract pages?", a: "Split creates several files at once. Extract pages creates one new PDF from the pages you pick." },
    { q: "Can I split a scanned PDF?", a: "Yes. Scans are just pages with images, and they split the same way." },
    { q: "Is my PDF uploaded?", a: "No. The new files are built in your browser, so confidential statements and contracts stay on your device." },
    { q: "Why won't my PDF open?", a: "Password-protected or encrypted PDFs can't be split. Remove the protection in a PDF reader that knows the password, save a copy, and use that." },
  ],
};

export default content;
