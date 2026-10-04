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
      heading: "Everything it counts",
      body: (
        <ul>
          <li><strong>Words, sentences and paragraphs</strong> — paragraphs are blocks separated by a blank line.</li>
          <li><strong>Characters</strong>, with and without spaces — many application forms limit one or the other, so check which.</li>
          <li><strong>Reading and speaking time</strong> — useful for blog posts, speeches and video scripts.</li>
          <li><strong>Top keywords</strong> — the eight most repeated words, ignoring common words like “the” and “and”, words under three letters and plain numbers.</li>
        </ul>
      ),
    },
    {
      heading: "Using keyword counts",
      body: (
        <p>
          The keyword list shows what your text is really about. If an essay on budgeting lists “really” or “very” near the top, that&apos;s a sign to tighten the writing. If an article you want
          found for “home loan” doesn&apos;t show “loan” in the list at all, the topic may not be as clear to readers or search engines as you think. Don&apos;t stuff keywords to push them up — write
          naturally and use the list as a check.
        </p>
      ),
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
    { q: "Does it count words in Hindi and other Indian languages?", a: "Yes. Word boundaries come from Unicode rules, so Devanagari, Tamil, Telugu, Bengali and other scripts are counted correctly." },
    { q: "Can I count a document?", a: "Open a .txt file, or copy the text from Word or a PDF and paste it here. To count a .docx directly, the Word document viewer shows its word count too." },
    { q: "Is my text stored?", a: "Only in this browser so it survives a refresh. It's never sent to a server. Use Clear to remove it." },
  ],
};

export default content;
