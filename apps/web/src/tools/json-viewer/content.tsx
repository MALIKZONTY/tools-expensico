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
  ],
  faqs: [
    { q: "What is a JSONPath?", a: "A JSONPath like $.orders[0].customer.name describes where a value sits in a document. Many tools (jq, JSON query libraries, Postman tests) accept similar paths." },
    { q: "Is my file uploaded?", a: "No. The file is read and parsed in your browser and never leaves your device." },
  ],
};

export default content;
