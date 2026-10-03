import Link from "next/link";
import { processorConfig } from "@/config/site";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open a .docx file.", "Read it with headings, lists, tables and images.", "Copy or download the plain text if you need it."],
  sections: [
    {
      heading: "What the viewer shows",
      body: <p>The document is converted to clean HTML in your browser with Mammoth, which maps Word styles such as Heading 1 and List Paragraph to proper structure. You see the content — text, emphasis, lists, tables, links and images — in a readable layout that adapts to your screen.</p>,
    },
    {
      heading: "Limitations",
      body: (
        <ul>
          <li>Exact page layout, fonts, colours, text boxes, headers, footers and footnotes aren&apos;t reproduced.</li>
          <li>Tracked changes and comments aren&apos;t shown.</li>
          <li>Legacy .doc files (Word 97–2003) can&apos;t be opened in the browser — save them as .docx first.</li>
        </ul>
      ),
    },
    ...(processorConfig.enabled
      ? [
          {
            heading: "Need a PDF?",
            body: <p>To turn the document into a PDF with its layout intact, use <Link href="/convert/docx-to-pdf">Word to PDF</Link>.</p>,
          },
        ]
      : []),
  ],
  faqs: [{ q: "Is my document uploaded?", a: "No. It's converted and displayed in your browser." }],
};

export default content;
