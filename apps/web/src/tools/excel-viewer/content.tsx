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
      heading: "Convert the data",
      body: <p>Need the data elsewhere? Use <Link href="/convert/xlsx-to-csv">Excel to CSV</Link>, <Link href="/convert/xlsx-to-json">Excel to JSON</Link> or <Link href="/convert/xlsx-to-html">Excel to HTML</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Can it open password-protected workbooks?", a: "No. Encrypted files need the password and a full spreadsheet application." },
    { q: "Is my spreadsheet uploaded?", a: "No. It's read entirely in your browser." },
  ],
};

export default content;
