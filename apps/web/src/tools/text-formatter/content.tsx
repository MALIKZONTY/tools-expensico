import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste your text.", "Click any operation to apply it; combine as many as you need.", "Undo if something isn't right, then copy or download."],
  sections: [
    {
      heading: "Fixing text copied from PDFs and emails",
      body: <p>Text copied from PDFs often has a line break at the end of every line. “Remove line breaks (keep paragraphs)” joins wrapped lines back into flowing paragraphs while keeping the blank lines between paragraphs. Follow with “Collapse extra spaces” to tidy any double spaces.</p>,
    },
    {
      heading: "Working with lists",
      body: <p>Paste a list of names, emails or IDs — one per line — then remove duplicates, sort, or number them. “Natural sort” orders numbers the way people expect (item 2 before item 10), unlike plain alphabetical sorting.</p>,
    },
    {
      heading: "Smart quotes and special characters",
      body: <p>Word processors replace straight quotes with curly ones and hyphens with dashes. That&apos;s fine for documents but breaks code, CSV files and some forms. “Smart quotes → straight” converts them back.</p>,
    },
  ],
  faqs: [{ q: "Is my text sent anywhere?", a: "No. Every operation runs in your browser." }],
};

export default content;
