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
  faqs: [{ q: "Is the text random?", a: "Yes. Apart from the optional classic first sentence, words are picked randomly from a Lorem Ipsum vocabulary each time you generate." }],
};

export default content;
