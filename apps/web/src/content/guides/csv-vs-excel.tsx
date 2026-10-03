import Link from "next/link";

export default function Guide() {
  return (
    <>
      <p>CSV and Excel files both hold tables, and Excel happily opens both. But they work very differently, and moving data between them causes some of the most common data errors in offices.</p>
      <h2>What&apos;s the difference?</h2>
      <table>
        <thead><tr><th></th><th>CSV</th><th>Excel (XLSX)</th></tr></thead>
        <tbody>
          <tr><td>Format</td><td>Plain text, one row per line</td><td>Zipped XML package</td></tr>
          <tr><td>Sheets</td><td>One</td><td>Many</td></tr>
          <tr><td>Formatting, formulas, charts</td><td>None</td><td>Yes</td></tr>
          <tr><td>Data types</td><td>Everything is text</td><td>Numbers, dates, text, booleans</td></tr>
          <tr><td>Compatibility</td><td>Almost universal</td><td>Spreadsheet apps</td></tr>
          <tr><td>Rows</td><td>Unlimited</td><td>1,048,576 per sheet</td></tr>
        </tbody>
      </table>
      <h2>Where things go wrong</h2>
      <p>When Excel opens a CSV, it guesses each value&apos;s type — and its guesses can permanently change your data if you then save:</p>
      <ul>
        <li><strong>Leading zeros vanish.</strong> PIN codes like 011001, employee IDs like 007 and phone numbers lose their leading zeros.</li>
        <li><strong>Long numbers are rounded.</strong> Excel keeps 15 significant digits, so a 16-digit card number or a long bank reference changes its last digits to zeros.</li>
        <li><strong>Large numbers turn into scientific notation</strong> such as 9.87654E+11.</li>
        <li><strong>Text becomes dates.</strong> Codes like 3-4 or MARCH1 may be converted into dates.</li>
        <li><strong>Garbled characters.</strong> CSVs without a UTF-8 marker can display Hindi, Tamil or accented names incorrectly.</li>
      </ul>
      <h2>How to move data safely</h2>
      <ul>
        <li><strong>CSV → Excel:</strong> convert the file rather than double-clicking it. A proper conversion stores codes with leading zeros and long numbers as text. Our <Link href="/convert/csv-to-xlsx">CSV to Excel converter</Link> does this automatically.</li>
        <li><strong>Excel → CSV:</strong> export with UTF-8 encoding (and a byte-order mark if the CSV will be reopened in Excel). Remember only values are exported — not formulas. Try <Link href="/convert/xlsx-to-csv">Excel to CSV</Link>.</li>
        <li><strong>Just looking?</strong> Open the CSV in a viewer that doesn&apos;t change anything, like the <Link href="/tools/csv-viewer">CSV viewer</Link>.</li>
      </ul>
      <h2>Commas, semicolons and quotes</h2>
      <p>
        In many European locales, spreadsheet apps write CSVs with semicolons because the comma is the decimal separator. Values that contain the separator, quotes or line breaks must be wrapped in
        double quotes, with any quotes inside doubled (<code>&quot;She said &quot;&quot;hi&quot;&quot;&quot;</code>). Well-behaved tools handle this automatically; hand-edited CSVs often break it.
      </p>
      <h2>Which should you use?</h2>
      <p>Use CSV to exchange data between systems — databases, accounting software, scripts. Use Excel when people need to read, format or analyse the data. Keep the CSV as your source of truth if both are involved.</p>
    </>
  );
}
