import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose two or more PDF files (you can add more later).", "Put them in the right order with the arrows.", "Select Merge and download the combined PDF."],
  sections: [
    {
      heading: "How merging works",
      body: <p>The PDFs are read in your browser with pdf-lib, and every page is copied — with its text, fonts, images and links — into a new document in the order you chose. Pages aren&apos;t re-rendered or re-compressed, so quality is exactly the same as the originals.</p>,
    },
    {
      heading: "Private by design",
      body: <p>Merging contracts, bank statements or ID documents on a website usually means uploading them. Here nothing is uploaded: the merge happens on your device and the result is created in your browser&apos;s memory.</p>,
    },
    {
      heading: "Related tools",
      body: (
        <ul>
          <li>Need only some pages? Use <Link href="/pdf/pdf-extract-pages">Extract pages</Link> first.</li>
          <li>Have photos or scans? Turn them into a PDF with <Link href="/convert/jpg-to-pdf">JPG to PDF</Link>.</li>
          <li>Result too big for email? Try <Link href="/pdf/pdf-compress">Compress PDF</Link>.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Are bookmarks and form fields kept?", a: "Page content, links and annotations are copied. The document outline (bookmarks) and interactive form fields of the original files are not merged." },
    { q: "Can I merge password-protected PDFs?", a: "No. Remove the password in a PDF reader first, then merge." },
    { q: "Is there a limit?", a: "Each file can be up to 300 MB. Very large merges depend on your device's memory." },
  ],
};

export default content;
