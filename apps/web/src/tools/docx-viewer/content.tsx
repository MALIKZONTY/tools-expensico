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
    {
      heading: "When it's useful",
      body: (
        <ul>
          <li>Reading a Word attachment on a computer or Chromebook without Microsoft Office.</li>
          <li>Checking what a document says before deciding whether to download Office or ask for a PDF.</li>
          <li>Getting the plain text out of a document to paste into an email, a form or another app.</li>
          <li>Counting the words in an assignment or article — the total appears next to the file name.</li>
        </ul>
      ),
    },
    {
      heading: "Copying the text",
      body: (
        <p>
          Copy and Download give you the document as plain text, with headings and paragraphs separated by blank lines and the formatting removed. That&apos;s usually what you want when pasting into a
          web form. To keep headings, lists and tables, select the text in the preview and copy it instead — most editors keep that formatting when you paste. Files up to 50 MB can be opened.
        </p>
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
  faqs: [
    { q: "Is my document uploaded?", a: "No. It's converted and displayed in your browser." },
    { q: "Can I edit the document?", a: "No. This is a viewer. To edit a .docx file without Office, open it in a free editor such as LibreOffice Writer or Google Docs." },
    { q: "Why does the layout look different from Word?", a: "The viewer shows the content in a readable, screen-friendly layout rather than reproducing pages. Fonts, margins, columns, text boxes, headers and footers are simplified." },
    { q: "Can it open password-protected documents?", a: "No. Encrypted .docx files can only be opened with the password in Word or a compatible editor." },
  ],
};

export default content;
