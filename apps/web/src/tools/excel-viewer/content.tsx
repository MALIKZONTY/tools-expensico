import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open an .xlsx, .xls or .ods file.", "Switch between sheets with the tabs.", "Search, filter and sort the data, or export a sheet as CSV."],
  sections: [
    {
      heading: "View spreadsheets without Excel",
      body: <p>Received a spreadsheet on a phone or a computer without Office? The viewer reads Excel 2007+ (XLSX/XLSM), Excel 97–2003 (XLS) and OpenDocument (ODS) files in your browser using SheetJS, and shows cell values exactly as they&apos;re formatted in the workbook — dates, percentages and currency included.</p>,
    },
    {
      heading: "What's shown",
      body: (
        <ul>
          <li>Every sheet, including hidden ones (marked as hidden).</li>
          <li>Formula results as last saved; formulas themselves aren&apos;t recalculated.</li>
          <li>Merged cells show their value in the top-left cell.</li>
          <li>Charts, images, colours and comments aren&apos;t displayed.</li>
        </ul>
      ),
    },
    {
      heading: "Finding what you need in a big sheet",
      body: (
        <>
          <p>
            The table is built for large sheets. The search box matches text in every column at once; the filter box under each column heading narrows that column alone, and filters combine, so you can
            find, say, every row where City contains “Pune” and Status contains “paid”. Click a column heading to sort it — columns of numbers sort numerically, so 100 comes after 20 rather than before it.
            Drag the edge of a heading to widen a column.
          </p>
          <p>
            <strong>Export CSV</strong> saves the current sheet. If a search or filter is active, only the matching rows are exported (the file name ends in <code>-filtered</code>), which is a quick way
            to pull a subset out of a large workbook. The CSV is UTF-8 with a byte-order mark, so Excel opens Indian-language text and the ₹ symbol correctly.
          </p>
        </>
      ),
    },
    {
      heading: "Convert the data",
      body: <p>Need the data elsewhere? Use <Link href="/convert/xlsx-to-csv">Excel to CSV</Link>, <Link href="/convert/xlsx-to-json">Excel to JSON</Link> or <Link href="/convert/xlsx-to-html">Excel to HTML</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Can it open password-protected workbooks?", a: "No. Encrypted files need the password and a full spreadsheet application." },
    { q: "Is my spreadsheet uploaded?", a: "No. It's read entirely in your browser." },
    { q: "Can I edit cells?", a: "No. The viewer is read-only. Export a sheet as CSV to edit it in any spreadsheet or text editor, or open the file in Google Sheets or LibreOffice Calc." },
    { q: "Why does a cell show a number instead of a formula?", a: "Workbooks store the last calculated result of each formula. The viewer shows that result and tells you how many formula cells the sheet contains; it doesn't recalculate them." },
    { q: "How large a file can I open?", a: "Up to 100 MB. Very large workbooks depend on your device's memory; if one is slow, try opening it on a computer rather than a phone." },
  ],
};

export default content;
