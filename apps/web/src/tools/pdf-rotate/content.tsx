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
  example: {
    heading: "Example: a scanned contract with two landscape pages",
    body: (
      <p>
        Open the PDF and look at the thumbnails. Pages 4 and 9 are tables scanned sideways, so use the arrows under just those two pages until they read normally. Every other page stays as it is.
        Select <strong>Save 2 rotated pages</strong>, and the file downloads as <code>contract-rotated.pdf</code>. If the whole document came out upside down, use <strong>Rotate all right</strong>{" "}
        twice instead. <strong>Reset</strong> undoes everything before you save.
      </p>
    ),
  },
  faqs: [
    { q: "Can I rotate by any angle?", a: "PDF page rotation only supports multiples of 90°. To straighten a slightly skewed scan, use scanning software with deskew." },
    { q: "Is my PDF uploaded?", a: "No. The rotation is written into a new copy of the PDF in your browser." },
    { q: "Does rotating change the file size?", a: "Hardly at all. Only a small rotation setting on each page changes; text and images aren't touched or re-compressed." },
    { q: "Why can't I open my PDF?", a: "Password-protected or encrypted PDFs can't be changed. Remove the protection in a PDF reader that knows the password, save a copy, and try that. PDFs up to 300 MB are supported." },
  ],
};

export default content;
