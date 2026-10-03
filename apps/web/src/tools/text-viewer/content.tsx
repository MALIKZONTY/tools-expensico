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
  ],
  faqs: [{ q: "Is my file uploaded?", a: "No. It's read entirely on your device." }],
};

export default content;
