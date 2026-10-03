import Link from "next/link";
import { processorConfig } from "@/config/site";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a PDF.", "Pick a method: lossless first; strong compression if you need a much smaller file.", "Compress and compare the before/after size, then download."],
  sections: [
    {
      heading: "Why PDFs are large",
      body: <p>Most of a PDF&apos;s size usually comes from images — especially scanned pages and photos saved at high resolution. Text and vector graphics are tiny by comparison. That&apos;s why a 20-page scanned document can be 30 MB while a 200-page report is 2 MB.</p>,
    },
    {
      heading: "The compression methods, honestly compared",
      body: (
        <ul>
          <li><strong>Lossless optimisation</strong> repacks the PDF&apos;s internal structure. It never changes how pages look and keeps text selectable, but savings are usually small (often under 10%). If no saving is possible, you get your original back.</li>
          <li><strong>Strong compression</strong> re-renders each page as a JPEG image at a lower resolution. It can shrink scans dramatically, but text becomes part of the image — you can&apos;t select, search or copy it any more. Fine for scans and forms you&apos;re uploading; not for documents people need to search.</li>
          {processorConfig.enabled && (
            <li><strong>Server compression</strong> uses Ghostscript to recompress images inside the PDF while keeping text as text. This requires uploading the file, which is clearly marked.</li>
          )}
        </ul>
      ),
    },
    {
      heading: "Other ways to get under a size limit",
      body: (
        <ul>
          <li>Remove pages you don&apos;t need with <Link href="/pdf/pdf-delete-pages">Delete pages</Link>.</li>
          <li>Split a long document into parts with <Link href="/pdf/pdf-split">Split PDF</Link>.</li>
          <li>If you&apos;re creating a PDF from photos, compress the photos first with the <Link href="/tools/image-compressor">image compressor</Link>.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Why didn't my PDF get smaller?", a: "Text-based PDFs (exported from Word, for example) are usually already compact. Lossless optimisation can't remove much; strong compression may even increase the size because rendered pages are images." },
    {
      q: "Is my PDF uploaded?",
      a: processorConfig.enabled
        ? "Not with lossless or strong compression — both run in your browser. Only the server option uploads the file, and it is clearly marked."
        : "No. Both lossless and strong compression run entirely in your browser, so your PDF never leaves your device.",
    },
    { q: "Will a government portal accept a strongly compressed PDF?", a: "Usually yes, as long as it's readable. Check that small print is still legible before submitting; choose a sharper level if needed." },
  ],
};

export default content;
