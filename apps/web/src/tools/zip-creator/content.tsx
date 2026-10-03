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
      heading: "Private bundling",
      body: <p>The archive is built in your browser; files aren&apos;t uploaded. If two files have the same name, the second gets a number added so nothing is overwritten. To open ZIPs, use the <Link href="/tools/zip-extractor">ZIP extractor</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Can I add a password?", a: "No. ZIP password protection is weak and isn't supported here. Use encrypted storage or 7-Zip with AES-256 for sensitive files." },
    { q: "Can I zip a whole folder?", a: "Select all the files inside the folder; folder structure isn't preserved in this version." },
  ],
};

export default content;
