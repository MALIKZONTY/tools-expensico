import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose the two files to compare.", "Select Compare.", "See whether they're identical; for text files, review the line-by-line differences."],
  sections: [
    {
      heading: "Two kinds of comparison",
      body: (
        <ul>
          <li><strong>Identical or not:</strong> both files are hashed with SHA-256. Matching hashes mean the files are byte-for-byte the same — works for any file type, from PDFs to videos.</li>
          <li><strong>What changed:</strong> if both are text files under 10 MB (code, CSV, JSON, logs), a line-by-line diff highlights additions and removals, with word-level highlights inside changed lines.</li>
        </ul>
      ),
    },
    {
      heading: "When to compare two files",
      body: (
        <ul>
          <li><strong>Duplicate check.</strong> Two photos or PDFs with different names — are they actually the same file? Matching hashes settle it.</li>
          <li><strong>Backup verification.</strong> Confirm a copy on a USB drive or cloud folder is identical to the original before you delete one.</li>
          <li><strong>Download integrity.</strong> Compare a file you downloaded twice, or against a copy a colleague sent, to rule out corruption.</li>
          <li><strong>Config and code changes.</strong> See exactly which lines changed between two versions of a settings file, CSV export or script.</li>
        </ul>
      ),
    },
    {
      heading: "Reading the result",
      body: (
        <p>
          When files differ, the result says whether they&apos;re the same size with different contents or different sizes altogether, and shows both SHA-256 hashes so you can record them. For text
          files, choose <strong>Side by side</strong> to read old and new versions next to each other, or <strong>Inline</strong> to see removed and added lines in one column. Each file can be up to
          500 MB; files of that size take longer to hash because every byte is read.
        </p>
      ),
    },
    {
      heading: "Comparing documents",
      body: <p>Word and PDF files are binary, so this tool can only tell you whether they differ. To compare their text, extract it first with <Link href="/convert/docx-to-text">Word to Text</Link> or <Link href="/convert/pdf-to-text">PDF to Text</Link>, then use the <Link href="/productivity/text-diff">text diff checker</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Are my files uploaded?", a: "No. Hashing and comparison happen in your browser." },
    { q: "Do the file names or dates matter?", a: "No. Only the contents are compared. Two files with different names and modification dates are reported as identical if every byte matches." },
    { q: "Why do two PDFs that look the same show as different?", a: "PDFs store hidden data such as creation dates and internal IDs, so re-saving or re-exporting the same document produces different bytes. Compare their extracted text instead." },
  ],
};

export default content;
