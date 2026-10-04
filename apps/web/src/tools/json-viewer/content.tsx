import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open a .json file or paste JSON.", "Expand and collapse objects and arrays to explore the structure.", "Search to highlight and reveal matching keys and values.", "Copy the JSONPath of any value for use in code or queries."],
  sections: [
    {
      heading: "Why use a tree view?",
      body: (
        <p>
          Large JSON documents — API responses, exports, configuration — are hard to scan as text. A tree shows the shape of the data: how many items each array holds, which keys each object has, and
          the type of every value (strings, numbers, booleans and null are colour-coded).
        </p>
      ),
    },
    {
      heading: "Working with large files",
      body: (
        <p>
          Nodes render only when expanded, and long arrays load in pages of a hundred items, so even multi-megabyte files stay responsive. The whole file is still parsed, so a syntax error anywhere is
          reported with its line number — or fix it in the <Link href="/developer/json-validator">JSON validator</Link>.
        </p>
      ),
    },
    {
      heading: "Typical uses",
      body: (
        <ul>
          <li>Exploring an API response copied from your browser&apos;s network tab or Postman.</li>
          <li>Finding one setting in a long configuration file such as <code>package.json</code>, a VS Code settings file or a Firebase export.</li>
          <li>Checking what a data export actually contains before writing code to import it.</li>
          <li>Getting the exact path to a deeply nested value to use in JavaScript, jq or a test assertion.</li>
        </ul>
      ),
    },
    {
      heading: "Tips",
      body: (
        <p>
          Use <strong>Expand all</strong> to open every level at once on small documents, and <strong>Collapse</strong> to get back to the top-level overview. Search matches both keys and values, so
          searching for an email address or an ID jumps straight to the record that contains it. Copy and Download give you the JSON re-indented with two spaces. Files up to 50 MB can be opened, or
          paste JSON directly.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "What is a JSONPath?", a: "A JSONPath like $.orders[0].customer.name describes where a value sits in a document. Many tools (jq, JSON query libraries, Postman tests) accept similar paths." },
    { q: "Is my file uploaded?", a: "No. The file is read and parsed in your browser and never leaves your device." },
    { q: "Why won't my JSON open?", a: "The viewer needs valid JSON. Common problems are trailing commas, single quotes instead of double quotes, and comments, which strict JSON doesn't allow. The error message points to the line and column of the first problem." },
    { q: "Can I edit values in the tree?", a: "No, the tree is read-only. To change and re-indent JSON, use the JSON formatter." },
  ],
};

export default content;
