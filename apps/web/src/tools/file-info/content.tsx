import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose any file.", "See what it really is, based on its contents rather than its name.", "Optionally calculate a SHA-256 checksum to verify it."],
  sections: [
    {
      heading: "Why the extension isn't enough",
      body: <p>A file&apos;s extension is just part of its name and can be changed by anyone. Most formats start with a recognisable &ldquo;magic number&rdquo;: PDFs begin with <code>%PDF-</code>, PNGs with the bytes <code>89 50 4E 47</code>, ZIP-based formats like DOCX and XLSX with <code>PK</code>. This tool reads those bytes — and for Office files, the structure inside the ZIP — to identify the real type.</p>,
    },
    {
      heading: "When this is useful",
      body: (
        <ul>
          <li>A file won&apos;t open and you want to know why.</li>
          <li>A download has a strange or missing extension.</li>
          <li>An email attachment claims to be a PDF but you&apos;re suspicious.</li>
          <li>You need a checksum to confirm a download — or use the <Link href="/developer/hash-generator">hash generator</Link> for MD5 and SHA-512 too.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Is my file uploaded?", a: "No. Only the first few kilobytes are read in your browser (the whole file if you ask for a checksum)." },
    { q: "Can it detect viruses?", a: "No. It identifies file types; it isn't an antivirus scanner." },
  ],
};

export default content;
