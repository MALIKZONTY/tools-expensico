import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Write Markdown on the left; the formatted preview updates on the right.", "Use the toolbar or shortcuts (Ctrl/⌘+B, I, K) for formatting.", "Switch between Write, Split and Preview views — on phones, Write and Preview work best.", "Export as .md or .html. Your draft is kept in this browser automatically."],
  sections: [
    {
      heading: "Markdown cheat sheet",
      body: (
        <table>
          <tbody>
            <tr><td><code># Heading</code></td><td>Heading (use ## and ### for smaller levels)</td></tr>
            <tr><td><code>**bold**</code> / <code>_italic_</code></td><td>Emphasis</td></tr>
            <tr><td><code>- item</code> / <code>1. item</code></td><td>Bulleted / numbered list</td></tr>
            <tr><td><code>- [ ] task</code></td><td>Task list item (GitHub style)</td></tr>
            <tr><td><code>[text](https://…)</code></td><td>Link</td></tr>
            <tr><td><code>`code`</code> and fenced <code>```</code> blocks</td><td>Inline and block code</td></tr>
            <tr><td><code>&gt; quote</code></td><td>Blockquote</td></tr>
            <tr><td><code>| a | b |</code></td><td>Table, with a <code>| --- | --- |</code> separator row</td></tr>
          </tbody>
        </table>
      ),
    },
    {
      heading: "Safe preview",
      body: <p>The preview supports GitHub-flavoured Markdown. Any raw HTML in your document is sanitised, so pasted content can&apos;t run scripts. To publish, export HTML or use the <Link href="/convert/markdown-to-html">Markdown to HTML converter</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Where is my document saved?", a: "In this browser's local storage (IndexedDB) on your device. It isn't uploaded. Export a copy of anything important." },
    { q: "Can I open an existing .md file?", a: "Use the Markdown viewer to open files, then copy the content here to edit." },
  ],
};

export default content;
