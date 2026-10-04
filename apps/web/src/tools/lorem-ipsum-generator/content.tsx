import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose paragraphs, sentences or words, and how many.", "Optionally start with the classic opening and wrap paragraphs in HTML tags.", "Copy or download the text."],
  sections: [
    {
      heading: "What is Lorem Ipsum?",
      body: <p>Lorem Ipsum is scrambled Latin derived from Cicero&apos;s <em>De finibus bonorum et malorum</em> (45 BC). Designers use it as placeholder text because it has a natural-looking distribution of word lengths without distracting readers with meaning.</p>,
    },
    {
      heading: "Use it carefully",
      body: <p>Placeholder text hides content problems: real headlines are longer, real names wrap differently and real copy needs room for translation. Replace Lorem Ipsum with realistic content as early as possible — and never ship it in a live product.</p>,
    },
  ],
  example: {
    heading: "How much text to generate",
    body: (
      <ul>
        <li><strong>A blog post layout</strong> — 4 to 6 paragraphs shows how body text, headings and images flow together.</li>
        <li><strong>A card or teaser</strong> — 2 sentences is roughly what a real summary takes up.</li>
        <li><strong>A button, label or headline</strong> — 2 to 8 words. Test the longest label you expect, not the shortest.</li>
        <li><strong>A CMS or email template</strong> — paragraphs with <code>&lt;p&gt;</code> tags paste straight into an HTML field.</li>
      </ul>
    ),
  },
  faqs: [
    { q: "How much can I generate?", a: "Up to 200 paragraphs or sentences, or up to 5,000 words, at a time." },
    { q: "Does Lorem Ipsum mean anything?", a: "Not really. It began as a passage of Cicero, but words were cut and altered, so it reads as Latin-looking nonsense. That's the point: readers notice the layout, not the message." },
    { q: "Is the text random?", a: "Yes. Apart from the optional classic first sentence, words are picked randomly from a Lorem Ipsum vocabulary each time you generate." },
  ],
};

export default content;
