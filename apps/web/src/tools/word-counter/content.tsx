import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Type or paste your text, or open a .txt file.", "Counts update as you type.", "Check reading time and keyword density for articles and essays."],
  sections: [
    {
      heading: "How words are counted",
      body: (
        <p>
          Words are found with the browser&apos;s Unicode word segmentation (<code>Intl.Segmenter</code>), the same rules used for double-click selection. That means hyphenated words, contractions
          like &ldquo;it&apos;s&rdquo; and text in Hindi, Tamil, Bengali and other Indian scripts are counted correctly — not just space-separated chunks.
        </p>
      ),
    },
    {
      heading: "Reading and speaking time",
      body: <p>Reading time assumes 238 words per minute, the average silent reading speed for adults reading non-fiction in English. Speaking time assumes 140 words per minute — a comfortable pace for presentations.</p>,
    },
    {
      heading: "Typical word limits",
      body: (
        <ul>
          <li>Tweet / X post: 280 characters (see the <Link href="/productivity/character-counter">character counter</Link>)</li>
          <li>LinkedIn post: 3,000 characters</li>
          <li>Blog post that ranks well: often 1,000–2,000 words, depending on the topic</li>
          <li>Statement of purpose for universities: commonly 500–1,000 words — always check the institution&apos;s limit</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Why does Microsoft Word give a slightly different count?", a: "Every program has slightly different rules for things like URLs, numbers with separators and dashes. Differences of a few words in a long document are normal." },
    { q: "Is my text stored?", a: "Only in this browser so it survives a refresh. It's never sent to a server. Use Clear to remove it." },
  ],
};

export default content;
