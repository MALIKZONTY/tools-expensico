import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste HTML or open an .html file.", "Choose line width and indentation.", "Copy or download the formatted markup."],
  sections: [
    {
      heading: "How it formats",
      body: <p>The formatter uses Prettier, the same tool many teams run in their editors. It parses the HTML (including inline <code>&lt;style&gt;</code> and <code>&lt;script&gt;</code>), then prints it with consistent indentation and wrapping. Because it parses first, badly broken markup produces an error with its location rather than mangled output.</p>,
    },
    {
      heading: "Whitespace is respected",
      body: <p>In HTML, spaces between inline elements can be visible. The formatter follows CSS display rules, so it won&apos;t add or remove spaces that would change how text renders — which is why some lines may look oddly broken around inline tags.</p>,
    },
    {
      heading: "Preview safely",
      body: (
        <p>
          The formatter never executes your HTML. To see what a page looks like, use the <Link href="/tools/html-viewer">HTML viewer</Link>, which renders it in a sandbox with scripts disabled.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Can it minify HTML?", a: "Not currently. Safe HTML minification has to respect whitespace-sensitive elements like <pre> and inline text, and we'd rather not offer a minifier that can subtly change your page." },
    { q: "Does it work with templates (JSX, Vue, Handlebars)?", a: "Plain HTML only. Template syntax may cause parse errors." },
  ],
};

export default content;
