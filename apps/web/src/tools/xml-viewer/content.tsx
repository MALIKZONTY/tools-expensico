import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open an .xml file (SVG, RSS and sitemap files work too).", "Explore it as a collapsible tree or read the formatted source.", "Search to reveal matching elements, attributes and values."],
  sections: [
    {
      heading: "Reading XML as a tree",
      body: <p>Elements become expandable nodes, attributes are shown with an <code>@</code> prefix, and text content as <code>#text</code>. Repeated elements are grouped into lists, so you can see at a glance how many <code>&lt;item&gt;</code> or <code>&lt;url&gt;</code> entries a feed or sitemap contains.</p>,
    },
    {
      heading: "Well-formedness check",
      body: <p>The file is validated as it opens. If a tag isn&apos;t closed, attributes aren&apos;t quoted or the nesting is wrong, you&apos;ll see the exact line and column. To fix formatting, use the <Link href="/developer/xml-formatter">XML formatter</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Is my file uploaded?", a: "No. It's parsed in your browser." },
    { q: "Are external entities or DTDs loaded?", a: "No. Nothing referenced by the file is fetched, which also protects against XML entity attacks." },
  ],
};

export default content;
