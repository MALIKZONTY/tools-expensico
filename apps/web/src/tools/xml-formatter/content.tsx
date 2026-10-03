import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste XML or open a file (.xml, .svg, RSS/Atom feeds).", "Choose Beautify or Minify and an indentation.", "Fix any errors shown with their line and column, then copy or download."],
  sections: [
    {
      heading: "Validation first",
      body: <p>Before formatting, the XML is checked for well-formedness: every tag closed and correctly nested, attribute values quoted, a single root element. Formatting broken XML would hide the problem, so you get a precise error instead.</p>,
    },
    {
      heading: "What's preserved",
      body: <p>Comments, CDATA sections, processing instructions (like <code>&lt;?xml …?&gt;</code>) and the DOCTYPE are kept exactly. Elements that contain only text stay on one line. Minify removes whitespace between tags and comments; text inside elements is kept.</p>,
    },
    {
      heading: "Related tools",
      body: (
        <p>
          Explore a document as a tree in the <Link href="/tools/xml-viewer">XML viewer</Link>, or convert it with <Link href="/convert/xml-to-json">XML to JSON</Link>.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Does it validate against an XSD schema?", a: "No. It checks that the XML is well-formed, not that it matches a particular schema." },
    { q: "Is whitespace in text changed?", a: "Leading and trailing whitespace around text between tags is trimmed when formatting. If your format treats that whitespace as meaningful (rare outside xml:space=\"preserve\"), keep the original." },
  ],
};

export default content;
