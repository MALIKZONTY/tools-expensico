import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose the files to include (you can add more).", "Name the archive and pick a compression level.", "Create the ZIP — it downloads automatically."],
  sections: [
    {
      heading: "What compresses well",
      body: <p>Text, CSV, JSON, Word and uncompressed images shrink a lot in a ZIP. JPGs, MP4s, PDFs with images and other ZIPs are already compressed, so they barely change — use “None” for them to save time. ZIP is still useful for bundling many files into one attachment.</p>,
    },
    {
      heading: "Choosing a compression level",
      body: (
        <ul>
          <li><strong>None (store only)</strong> — fastest. Best for photos, videos, PDFs and other already-compressed files, or when you only need one attachment instead of many.</li>
          <li><strong>Fast</strong> — a quick pass that still shrinks text noticeably.</li>
          <li><strong>Normal</strong> — the default and the right choice for most mixed folders.</li>
          <li><strong>Maximum</strong> — squeezes a few more percent out of large text files such as logs and CSV exports, at the cost of time.</li>
        </ul>
      ),
    },
    {
      heading: "Good uses",
      body: (
        <ul>
          <li>Sending a set of documents for a loan, visa or job application as a single attachment.</li>
          <li>Shrinking large CSV, log or JSON exports before emailing them.</li>
          <li>Bundling project files for a client without installing archive software on a shared computer.</li>
        </ul>
      ),
    },
    {
      heading: "Private bundling",
      body: <p>The archive is built in your browser; files aren&apos;t uploaded. If two files have the same name, the second gets a number added so nothing is overwritten. To open ZIPs, use the <Link href="/tools/zip-extractor">ZIP extractor</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Can I add a password?", a: "No. ZIP password protection is weak and isn't supported here. Use encrypted storage or 7-Zip with AES-256 for sensitive files." },
    { q: "Are my files uploaded?", a: "No. The ZIP is created in your browser and downloaded directly to your device." },
    { q: "Is there a size limit?", a: "The files you add can total up to 2 GB. Very large archives depend on your device's memory, so a computer handles them better than a phone." },
    { q: "Can I zip a whole folder?", a: "Select all the files inside the folder; folder structure isn't preserved in this version." },
  ],
};

export default content;
