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
  ],
  faqs: [{ q: "Is my file uploaded?", a: "No. It's rendered in your browser." }],
};

export default content;
