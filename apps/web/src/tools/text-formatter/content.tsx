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
  example: {
    heading: "Example: cleaning up a list of email addresses",
    body: (
      <>
        <p>You&apos;ve copied attendee emails from three spreadsheets and some appear twice, a few have stray spaces, and there are blank lines between the blocks. Apply, in order:</p>
        <ol>
          <li><strong>Trim each line</strong> — removes spaces before and after each address.</li>
          <li><strong>Remove blank lines</strong> — joins the three blocks into one list.</li>
          <li><strong>Remove duplicate lines</strong> — keeps the first copy of each address.</li>
          <li><strong>Sort A → Z</strong> — makes the list easy to scan.</li>
        </ol>
        <p>Trim before removing duplicates: otherwise <code>asha@example.com</code> and <code>asha@example.com </code> with a trailing space count as different lines. If a step does the wrong thing, Undo goes back up to 20 steps.</p>
      </>
    ),
  },
  faqs: [
    { q: "Is my text sent anywhere?", a: "No. Every operation runs in your browser." },
    { q: "Which operations are available?", a: "Trim lines, collapse spaces, remove blank lines, join wrapped lines into paragraphs, remove duplicates, sort A→Z or Z→A, natural sort, reverse, shuffle, add or remove line numbers, straighten smart quotes, and remove punctuation or non-ASCII characters." },
    { q: "Is removing duplicates case-sensitive?", a: "Yes — lines must match exactly. For case-insensitive de-duplication, convert everything to lower case first with the case converter, then remove duplicates." },
    { q: "Will “Remove non-ASCII characters” delete Hindi or other scripts?", a: "Yes. It keeps only basic English letters, digits and symbols, so don't use it on text in Indian languages or with accents you want to keep." },
  ],
};

export default content;
