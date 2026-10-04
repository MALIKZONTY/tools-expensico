import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste JavaScript or TypeScript, or open a file.", "Choose the language and style options.", "Copy or download the formatted code."],
  sections: [
    {
      heading: "Powered by Prettier",
      body: <p>The formatter runs Prettier — the most widely used JavaScript formatter — directly in your browser. It supports modern syntax (ES2024+, JSX, TypeScript including generics and decorators) and prints code in a consistent, widely accepted style.</p>,
    },
    {
      heading: "Reading minified code",
      body: <p>Formatting a minified bundle restores line breaks and indentation, which makes it much easier to follow. Variable names shortened by a minifier can&apos;t be restored, though — that would require the source map.</p>,
    },
    {
      heading: "The options",
      body: (
        <ul>
          <li><strong>Language</strong> — JavaScript / JSX or TypeScript / TSX. Choose TypeScript for type annotations, interfaces and generics, or they&apos;ll be reported as syntax errors.</li>
          <li><strong>Line width</strong> — 80, 100 or 120 characters. Prettier wraps longer lines at this width; 80 is its default, and many teams choose 100 or 120 for wide screens.</li>
          <li><strong>Semicolons</strong> — add a semicolon at the end of every statement, or only where JavaScript needs one to avoid ambiguity.</li>
          <li><strong>Single quotes</strong> — use <code>&apos;</code> instead of <code>&quot;</code> for strings, unless that would need more escaping.</li>
        </ul>
      ),
    },
    {
      heading: "When it's useful",
      body: (
        <p>
          Tidying a snippet from Stack Overflow or ChatGPT before pasting it into a project; reading a minified script to find out what it does; making a code sample consistent before putting it
          in documentation or a blog post; or formatting code on a machine where you can&apos;t install an editor plug-in. For JSON, CSS and HTML there are dedicated formatters with options suited
          to each language.
        </p>
      ),
    },
    {
      heading: "Private by design",
      body: <p>Code is formatted locally; nothing is uploaded. Prettier is loaded only when you open this page, so other Expensico tools stay fast.</p>,
    },
  ],
  faqs: [
    { q: "Why are there so few options?", a: "Prettier is intentionally opinionated: a small set of options keeps code consistent across teams. The most commonly changed ones are offered here." },
    { q: "Why does it report a syntax error?", a: "Prettier must parse the code before it can print it, so it stops at real syntax errors such as a missing bracket. The message gives the line and column. TypeScript syntax in JavaScript mode also causes this — switch the language to TypeScript." },
    { q: "Can it minify JavaScript?", a: "No. Minifying JavaScript safely requires a full minifier like Terser or esbuild, which belongs in your build process." },
  ],
};

export default content;
