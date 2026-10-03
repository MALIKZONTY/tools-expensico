import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open a .csv or .tsv file — the delimiter and encoding are detected automatically.", "Search across all columns, or turn on column filters.", "Click a column header to sort; drag its edge to resize.", "Export the filtered view as a new CSV."],
  sections: [
    {
      heading: "Why not just open it in Excel?",
      body: <p>Excel reformats CSV data as it opens it: leading zeros disappear from PIN codes and phone numbers, long account numbers turn into scientific notation, and dates may be reinterpreted. This viewer shows the file exactly as written, so you can inspect data without changing it. When you do need a spreadsheet, <Link href="/convert/csv-to-xlsx">convert CSV to Excel</Link> safely.</p>,
    },
    {
      heading: "Large files",
      body: <p>Big files are parsed in a background thread so the page stays responsive, and the table shows one page of rows at a time. Files of 100 MB or more work on most laptops; phones have less memory.</p>,
    },
    {
      heading: "Handling messy CSVs",
      body: <p>The parser follows RFC 4180: quoted fields can contain commas, quotes (written as two quotes) and line breaks. If a row has an unclosed quote or the wrong number of columns, you&apos;ll see a warning with the row number. Files saved by Excel on Windows that aren&apos;t UTF-8 are read as Windows-1252 with a notice.</p>,
    },
  ],
  faqs: [
    { q: "Is my file uploaded?", a: "No. It's read and parsed in your browser." },
    { q: "Can I edit cells?", a: "This is a viewer. To change data, export it and edit in a spreadsheet, or convert to JSON for programmatic changes." },
  ],
};

export default content;
