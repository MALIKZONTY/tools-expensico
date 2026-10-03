import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste CSS, SCSS or Less, or open a stylesheet.", "Choose Beautify for readable code or Minify for production.", "Copy or download the result."],
  sections: [
    {
      heading: "Beautify",
      body: <p>Beautifying uses Prettier to put one declaration per line, normalise spacing and indentation, and format nested SCSS/Less rules — handy for reading minified third-party CSS or tidying hand-written styles.</p>,
    },
    {
      heading: "Minify",
      body: <p>Minifying removes comments and every whitespace character that doesn&apos;t affect meaning. It&apos;s deliberately conservative: spaces inside <code>calc()</code>, before pseudo-classes in descendant selectors, and inside strings and <code>url()</code> are kept. It doesn&apos;t merge rules or shorten colours, so the result is always equivalent to your input.</p>,
    },
  ],
  faqs: [
    { q: "Why does minify fail on invalid CSS?", a: "The stylesheet is parsed before minifying so broken CSS is reported instead of silently producing broken output." },
    { q: "Should I minify SCSS?", a: "Browsers can't read SCSS — compile it to CSS first, then minify the CSS." },
  ],
};

export default content;
