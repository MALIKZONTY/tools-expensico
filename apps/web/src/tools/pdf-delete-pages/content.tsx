import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a PDF.", "Click the pages to remove — they're marked in red — or type ranges.", "Select Delete pages and download the cleaned-up PDF."],
  sections: [
    {
      heading: "Common reasons to remove pages",
      body: (
        <ul>
          <li>Blank pages produced by double-sided scanning</li>
          <li>Cover sheets, separator pages or duplicated pages</li>
          <li>Pages with information the recipient shouldn&apos;t see</li>
        </ul>
      ),
    },
    {
      heading: "Removing sensitive content",
      body: <p>Deleting a page removes it from the new file entirely. If you need to hide part of a page instead, a visual box isn&apos;t enough — the text underneath can often still be copied. Use proper redaction in a PDF editor for that.</p>,
    },
  ],
  faqs: [
    { q: "Is my original PDF modified?", a: "No. A new PDF is created for download; the original file on your device is untouched." },
    { q: "Is the PDF uploaded?", a: "No. Pages are removed in your browser." },
  ],
};

export default content;
