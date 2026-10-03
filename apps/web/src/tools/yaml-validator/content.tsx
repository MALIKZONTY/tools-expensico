import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste YAML or open a .yml/.yaml file. The example contains a deliberate tab error.", "Read the error with its line and column, fix it, and the check re-runs instantly.", "Inspect the parsed result as JSON to confirm values mean what you think."],
  sections: [
    {
      heading: "Common YAML mistakes",
      body: (
        <ul>
          <li><strong>Tabs for indentation.</strong> YAML forbids tab characters in indentation — use spaces.</li>
          <li><strong>Inconsistent indentation</strong> inside the same block.</li>
          <li><strong>Missing space after a colon:</strong> <code>key:value</code> is a single string, not a key/value pair.</li>
          <li><strong>Unquoted special values:</strong> <code>yes</code>, <code>no</code>, <code>on</code>, <code>off</code> and <code>08</code> may be read as booleans or octal by YAML 1.1 tools. Quote them when you mean text.</li>
          <li><strong>Colons or # in values</strong> such as URLs with ports or comments in passwords — quote the value.</li>
        </ul>
      ),
    },
    {
      heading: "Why show the result as JSON?",
      body: (
        <p>
          A YAML file can be syntactically valid but mean something different from what you intended. Seeing the parsed structure — which items are lists, which values are numbers — catches those mistakes.
          Convert files in either direction with <Link href="/convert/yaml-to-json">YAML to JSON</Link> and <Link href="/convert/json-to-yaml">JSON to YAML</Link>.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Does it validate Kubernetes or Docker Compose schemas?", a: "It validates YAML syntax, not a specific schema. A Kubernetes manifest with a misspelled field will still be valid YAML." },
    { q: "Are multiple documents (---) supported?", a: "Yes. Multi-document files are parsed into a JSON array, one item per document." },
  ],
};

export default content;
