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
    {
      heading: "What people open with it",
      body: (
        <ul>
          <li><strong>Sitemaps</strong> — count the URLs in a sitemap.xml and check each entry&apos;s <code>lastmod</code> date.</li>
          <li><strong>RSS and Atom feeds</strong> — see every item&apos;s title, link and publication date without a feed reader.</li>
          <li><strong>SVG images</strong> — inspect the paths, groups and attributes inside an icon or illustration.</li>
          <li><strong>Data exports and config</strong> — invoice exports, Android layouts, Maven <code>pom.xml</code> files and other XML formats.</li>
        </ul>
      ),
    },
    {
      heading: "Tree view or formatted source?",
      body: (
        <p>
          The tree is best for understanding structure and finding values: search filters it to the elements, attributes and text that match. The formatted source shows the document as XML again,
          indented consistently, which is what you want when copying a fragment into code or a ticket. Copy and Download always give you the formatted XML. Files up to 50 MB can be opened.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Is my file uploaded?", a: "No. It's parsed in your browser." },
    { q: "Why does my file say it isn't well-formed?", a: "XML is strict: every opening tag needs a matching closing tag, attribute values must be quoted, and characters like & must be written as &amp;. The error shows the line and column where parsing stopped; the real mistake is usually on that line or just before it." },
    { q: "Can I convert XML to JSON?", a: "Yes. The tree shows the same structure the XML to JSON converter produces; use that converter to download the JSON file." },
    { q: "Are external entities or DTDs loaded?", a: "No. Nothing referenced by the file is fetched, which also protects against XML entity attacks." },
  ],
};

export default content;
