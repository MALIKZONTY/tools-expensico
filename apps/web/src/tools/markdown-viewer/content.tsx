import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open a .md or .markdown file — READMEs, changelogs, notes.", "Read it rendered with headings, lists, tables and code blocks.", "Switch to Source to see the raw Markdown."],
  sections: [
    {
      heading: "GitHub-flavoured Markdown",
      body: <p>Tables, task lists, strikethrough and fenced code blocks render the way they do on GitHub. Relative images and links in the file won&apos;t resolve, because only the single file is opened.</p>,
    },
    {
      heading: "Safe rendering",
      body: <p>Markdown can contain raw HTML. The viewer sanitises it, removing scripts, event handlers and forms, so opening a Markdown file from an unknown source can&apos;t run code in your browser. To write or edit Markdown, use the <Link href="/productivity/markdown-editor">Markdown editor</Link>.</p>,
    },
    {
      heading: "When a Markdown viewer helps",
      body: (
        <ul>
          <li>Reading a project&apos;s README or CHANGELOG after downloading it as a ZIP, without opening a code editor or GitHub.</li>
          <li>Checking notes exported from apps that save Markdown, such as Obsidian, Notion exports or Joplin.</li>
          <li>Reviewing documentation someone emailed you as a .md file before you reply.</li>
          <li>Opening a .txt file that was written in Markdown syntax and is hard to read as plain text.</li>
        </ul>
      ),
    },
    {
      heading: "Copying or saving the result",
      body: (
        <p>
          The Copy and Download buttons follow the view you&apos;re in. In <strong>Rendered</strong> view they give you the sanitised HTML (saved as <code>document.html</code>), ready to paste into an
          email template or a CMS that accepts HTML. In <strong>Source</strong> view they give you the original Markdown. Files up to 20 MB can be opened.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Is my file uploaded?", a: "No. It's rendered in your browser." },
    { q: "Why are some images missing?", a: "Images referenced with relative paths (like ./img/diagram.png) live next to the original file, and only the Markdown file itself is opened. Images linked with a full https:// address display normally." },
    { q: "Can I open .txt files?", a: "Yes. Any .md, .markdown or .txt file is rendered as Markdown; plain text without Markdown syntax simply appears as paragraphs." },
    { q: "Can I edit the file here?", a: "This page is a viewer. To write or change Markdown with a live preview, open the Markdown editor." },
  ],
};

export default content;
