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
  ],
};

export default content;
