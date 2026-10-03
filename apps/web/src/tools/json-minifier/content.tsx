import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste or open your JSON.", "The minified version appears instantly, with the bytes saved.", "Copy it or download it as a .json file."],
  sections: [
    {
      heading: "What minifying removes",
      body: (
        <p>
          Minifying removes every space, tab and line break that isn&apos;t inside a string. The data is identical — any JSON parser reads the minified and the formatted version the same way — but the file
          is smaller, which helps when embedding JSON in URLs, HTML attributes, environment variables or network payloads.
        </p>
      ),
    },
    {
      heading: "Minify vs compress",
      body: (
        <p>
          Web servers usually compress responses with gzip or Brotli, which already shrinks whitespace dramatically. Minifying still helps where compression isn&apos;t applied, such as local storage
          limits or configuration values. To make minified JSON readable again, use the <Link href="/developer/json-formatter">JSON formatter</Link>.
        </p>
      ),
    },
  ],
  example: { body: <p>A 2 KB pretty-printed API response with 2-space indentation typically shrinks by 20–40% when minified, depending on how deeply it is nested.</p> },
  faqs: [
    { q: "Will minifying break my JSON?", a: "No. The input is parsed and re-serialised, so the output is guaranteed to be valid JSON with the same data. Invalid input is reported instead." },
    { q: "Can I minify JSON with comments?", a: "Comments aren't valid JSON. Remove them first; the error message points to where they are." },
  ],
};

export default content;
