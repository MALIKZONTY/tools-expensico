import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a PDF.", "Review its properties: title, author, software, dates, version and page sizes.", "Optionally download a copy with the metadata removed."],
  sections: [
    {
      heading: "What PDF metadata reveals",
      body: <p>PDFs carry hidden properties: the author&apos;s name (often from their computer account), the software that created the file, and creation and modification dates. Before sharing a document publicly or with a client, it&apos;s worth checking what it says about you or your organisation.</p>,
    },
    {
      heading: "What removal does — and doesn't do",
      body: (
        <>
          <p>Removing metadata clears the document information dictionary and the XMP metadata stream. It doesn&apos;t change pages, and it doesn&apos;t remove information inside page content — names in headers, comments, or text hidden behind shapes.</p>
          <p>Photos have similar hidden data; check them with the <Link href="/tools/image-metadata">image metadata viewer</Link>.</p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "What is a linearized PDF?", a: "A linearized (“fast web view”) PDF is arranged so the first page can display before the whole file has downloaded." },
    { q: "Is my PDF uploaded?", a: "No. It's read in your browser." },
  ],
};

export default content;
