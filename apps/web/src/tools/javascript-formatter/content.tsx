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
      heading: "Private by design",
      body: <p>Code is formatted locally; nothing is uploaded. Prettier is loaded only when you open this page, so other Expensico tools stay fast.</p>,
    },
  ],
  faqs: [
    { q: "Why are there so few options?", a: "Prettier is intentionally opinionated: a small set of options keeps code consistent across teams. The most commonly changed ones are offered here." },
    { q: "Can it minify JavaScript?", a: "No. Minifying JavaScript safely requires a full minifier like Terser or esbuild, which belongs in your build process." },
  ],
};

export default content;
