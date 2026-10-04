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
      heading: "Selecting pages quickly",
      body: (
        <>
          <p>Click thumbnails for a few pages, or type a selection and press Apply. The two stay in sync, so you can type a range and then click to adjust it.</p>
          <ul>
            <li><code>1-3, 8</code> — pages 1, 2, 3 and 8</li>
            <li><code>10-</code> or <code>10-end</code> — page 10 to the last page</li>
            <li><code>-5</code> — pages 1 to 5</li>
          </ul>
          <p>The <strong>Odd pages</strong> and <strong>Even pages</strong> buttons are useful for scans: if every second page of a double-sided scan is blank, select Even pages and delete them in one go. The bar at the bottom always shows how many pages the new PDF will have. The downloaded file ends in <code>-edited.pdf</code>; PDFs up to 300 MB can be opened.</p>
        </>
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
    { q: "Does deleting pages reduce the file size?", a: "Usually, yes — the removed pages and anything only they used are left out of the new file. Images or fonts shared with remaining pages stay. To shrink it further, use Compress PDF." },
    { q: "Can I delete every page?", a: "No. A PDF must have at least one page, so at least one page has to remain." },
    { q: "Why won't my PDF open?", a: "Password-protected or encrypted PDFs can't be edited. Remove the protection in a PDF reader that knows the password, save a copy, and open that instead." },
  ],
};

export default content;
