import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: [
    "Paste JSON, open a .json file, or edit the example.",
    "Choose Beautify for readable output or Minify for the smallest size.",
    "Pick an indentation and optionally sort keys alphabetically.",
    "Copy or download the result. Errors are shown with the exact line and column.",
  ],
  sections: [
    {
      heading: "What a JSON formatter does",
      body: (
        <p>
          APIs and logs usually emit JSON on a single line to save space. A formatter parses that JSON and re-prints it with consistent indentation and line breaks so you can read the structure.
          Because the text is fully parsed first, formatting also validates it: if anything is wrong, you get an error instead of a misleading result.
        </p>
      ),
    },
    {
      heading: "Is it safe to paste tokens or customer data?",
      body: (
        <p>
          Yes. Formatting runs entirely in your browser with the built-in <code>JSON.parse</code> and <code>JSON.stringify</code>. Nothing you paste is sent to a server or stored. For JWTs, use the{" "}
          <Link href="/developer/jwt-decoder">JWT decoder</Link>.
        </p>
      ),
    },
    {
      heading: "Things that look like JSON but aren't",
      body: (
        <ul>
          <li>Trailing commas after the last item: <code>[1, 2,]</code></li>
          <li>Single-quoted strings or unquoted keys: <code>{"{'a': 1}"}</code>, <code>{"{a: 1}"}</code></li>
          <li>Comments, <code>undefined</code>, <code>NaN</code> or functions</li>
        </ul>
      ),
    },
  ],
  example: {
    body: (
      <>
        <p>Input:</p>
        <pre>
          <code>{'{"id":7,"tags":["a","b"],"ok":true}'}</code>
        </pre>
        <p>Beautified with 2 spaces:</p>
        <pre>
          <code>{'{\n  "id": 7,\n  "tags": [\n    "a",\n    "b"\n  ],\n  "ok": true\n}'}</code>
        </pre>
      </>
    ),
  },
  faqs: [
    { q: "Does sorting keys change my data?", a: "No. JSON objects are unordered by definition, so sorting keys only changes presentation. Array order is never changed." },
    { q: "How large a file can I format?", a: "Files of tens of megabytes work in most desktop browsers. Very large files may be slow on phones." },
    { q: "Are big numbers preserved?", a: "JavaScript numbers are precise to about 15–16 significant digits. Integers larger than 9,007,199,254,740,991 lose precision when parsed — keep such IDs as strings." },
  ],
};

export default content;
