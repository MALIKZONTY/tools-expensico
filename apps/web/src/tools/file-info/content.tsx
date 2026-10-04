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
  example: {
    heading: "What the report shows",
    body: (
      <>
        <p>For every file you get its name and extension, the detected type and <em>how</em> it was detected (file signature, container structure, text content, or extension only), the type your browser guessed, the exact size in bytes, the last-modified date, whether it&apos;s text or binary, and its first 32 bytes in hexadecimal.</p>
        <p>
          If the contents don&apos;t match the extension — say <code>invoice.pdf</code> that is really a ZIP or a Windows program — you&apos;ll see a warning. That mismatch is a common trick in phishing
          emails, so treat such files with care. Files of any size up to 2 GB can be checked.
        </p>
      </>
    ),
  },
  faqs: [
    { q: "Is my file uploaded?", a: "No. Only the first few kilobytes are read in your browser (the whole file if you ask for a checksum)." },
    { q: "Can it detect viruses?", a: "No. It identifies file types; it isn't an antivirus scanner." },
    { q: "How do I verify a checksum?", a: "Calculate the SHA-256 here, copy it, and compare it with the checksum published by whoever provided the file. If even one character differs, the file isn't the one they published." },
    { q: "What if the type is “Unrecognised”?", a: "The file doesn't start with a signature this tool knows. It may be a specialised format, an encrypted file, or a damaged download. The hex bytes shown can help you search for the format." },
  ],
};

export default content;
