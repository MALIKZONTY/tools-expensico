import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste your JSON or open a file.", "Read the result: “Valid JSON”, or the exact line and column of the first error with an explanation.", "Fix the error and the check updates instantly."],
  sections: [
    {
      heading: "What makes JSON valid",
      body: (
        <ul>
          <li>Strings and object keys use double quotes.</li>
          <li>Values are strings, numbers, true, false, null, objects or arrays.</li>
          <li>Items are separated by commas, with no comma after the last item.</li>
          <li>No comments, no trailing commas, no <code>undefined</code>.</li>
        </ul>
      ),
    },
    {
      heading: "The most common JSON errors",
      body: (
        <ol>
          <li><strong>Trailing comma</strong> — common when copying from JavaScript objects.</li>
          <li><strong>Single quotes</strong> — Python dictionaries printed with <code>print()</code> use them.</li>
          <li><strong>Missing comma</strong> between two properties after editing by hand.</li>
          <li><strong>Unescaped characters</strong> inside strings, such as a raw line break or a backslash in a Windows path.</li>
          <li><strong>Truncated output</strong> — a log line or API response cut off before the closing brackets.</li>
        </ol>
      ),
    },
    {
      heading: "Validation vs schema validation",
      body: (
        <p>
          This tool checks syntax: whether the text is JSON at all. It doesn&apos;t check that the data has the fields your application expects — that&apos;s what JSON Schema is for. To read and
          explore valid JSON, use the <Link href="/tools/json-viewer">JSON viewer</Link>.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Why does my JSON work in JavaScript but fail here?", a: "JavaScript object literals are more permissive than JSON: they allow single quotes, unquoted keys, trailing commas and comments. JSON.parse — and every API — follows the stricter JSON standard." },
    { q: "Is my data sent anywhere?", a: "No. Validation uses your browser's own JSON parser and nothing leaves your device." },
  ],
};

export default content;
