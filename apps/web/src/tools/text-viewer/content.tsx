import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open a text or log file.", "Scroll with line numbers, toggle wrapping, and filter to lines containing a word.", "Copy or download the content."],
  sections: [
    {
      heading: "Built for big logs",
      body: <p>Server logs and data dumps can be hundreds of megabytes. The viewer splits the file into lines and renders them in chunks, so you can open files that would freeze a normal text editor in the browser. The line filter works like <code>grep</code> — handy for finding errors in a log.</p>,
    },
    {
      heading: "Encodings and line endings",
      body: <p>Files are read as UTF-8 when possible; UTF-16 files with a byte-order mark are supported, and anything else falls back to Windows-1252 with a warning. The file details show whether it uses Windows (CRLF) or Unix (LF) line endings.</p>,
    },
    {
      heading: "Common uses",
      body: (
        <ul>
          <li><strong>Searching a log.</strong> Type <code>ERROR</code> or a request ID in the filter to see only matching lines, with their original line numbers kept so you can find them again.</li>
          <li><strong>Checking an export before importing it.</strong> Open a CSV as plain text to see the real delimiter, quoting and header row that a spreadsheet would hide.</li>
          <li><strong>Diagnosing garbled characters.</strong> The encoding shown next to the file name tells you whether a file is UTF-8 or a legacy Windows encoding — the usual cause of â€™-style characters.</li>
        </ul>
      ),
    },
    {
      heading: "Tips",
      body: (
        <p>
          The filter isn&apos;t case-sensitive, so <code>timeout</code> also matches <code>Timeout</code> and <code>TIMEOUT</code>. Turn off <em>Wrap long lines</em> for minified files or wide tables
          so each record stays on one row. The first 2,000 lines appear immediately and “Show more” loads the rest in larger steps, which keeps scrolling smooth in very large files. Files up to 100 MB
          can be opened.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Is my file uploaded?", a: "No. It's read entirely on your device." },
    { q: "Which file types can I open?", a: "Text-based files: .txt, .log, .csv, .json, .xml, .yaml, .md and .html. Binary files such as .docx or .pdf aren't text; use the matching viewer for those." },
    { q: "Does downloading change the file?", a: "The download contains the decoded text with Unix (LF) line endings. If the original used Windows (CRLF) endings or a legacy encoding, keep the original file when exact bytes matter." },
    { q: "Can I search with regular expressions?", a: "The filter matches plain text. To test a pattern against text, use the regex tester." },
  ],
};

export default content;
