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
      heading: "Comparing documents",
      body: <p>Word and PDF files are binary, so this tool can only tell you whether they differ. To compare their text, extract it first with <Link href="/convert/docx-to-text">Word to Text</Link> or <Link href="/convert/pdf-to-text">PDF to Text</Link>, then use the <Link href="/productivity/text-diff">text diff checker</Link>.</p>,
    },
  ],
  faqs: [{ q: "Are my files uploaded?", a: "No. Hashing and comparison happen in your browser." }],
};

export default content;
