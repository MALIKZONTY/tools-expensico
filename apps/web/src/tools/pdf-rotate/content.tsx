import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a PDF.", "Rotate individual pages with the arrows, or rotate all pages at once.", "Save and download the corrected PDF."],
  sections: [
    {
      heading: "Permanent, lossless rotation",
      body: <p>Many PDF viewers only rotate the view, so the page is sideways again next time. This tool changes the rotation stored in the PDF itself, so it opens the right way up everywhere. Page content isn&apos;t re-rendered, so text and image quality are unchanged.</p>,
    },
    {
      heading: "Typical uses",
      body: (
        <ul>
          <li>Fixing landscape pages in a scanned document</li>
          <li>Correcting photos of documents taken sideways on a phone</li>
          <li>Preparing PDFs for printing or presentation</li>
        </ul>
      ),
    },
  ],
  faqs: [{ q: "Can I rotate by any angle?", a: "PDF page rotation only supports multiples of 90°. To straighten a slightly skewed scan, use scanning software with deskew." }],
};

export default content;
