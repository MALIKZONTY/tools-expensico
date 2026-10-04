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
      heading: "Every property the tool shows",
      body: (
        <ul>
          <li><strong>Title, author, subject and keywords</strong> — the document information fields, often filled in automatically from the original Word or PowerPoint file.</li>
          <li><strong>Created with and PDF producer</strong> — the application that wrote the document and the library that produced the PDF, such as Microsoft Word and a print-to-PDF driver.</li>
          <li><strong>Created and modified dates</strong> — when the file was first made and last saved.</li>
          <li><strong>PDF version, page count and page sizes</strong> — useful when a printer or portal requires A4 or a specific PDF version.</li>
          <li><strong>Fast web view, form fields and XMP metadata</strong> — whether the file is linearized, contains fillable form fields, and carries an extra XMP metadata block.</li>
        </ul>
      ),
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
    { q: "Why does the author show my computer's user name?", a: "Word, Excel and many PDF printers copy the account name of whoever created the file into the Author field. Removing metadata clears it from the downloaded copy." },
    { q: "How can I check a PDF's page size?", a: "Open it here and look at Page sizes. If pages differ, each size is listed with how many pages use it." },
  ],
};

export default content;
