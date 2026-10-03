import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste your text.", "See the sentence count, average sentence length and a readability score.", "Review highlighted long sentences and consider splitting them."],
  sections: [
    {
      heading: "Why sentence length matters",
      body: <p>Readers understand short sentences more easily. Plain-language guidelines commonly suggest an average of 15–20 words, with few sentences over 25. Long sentences aren&apos;t wrong, but several in a row make text tiring — especially on phones.</p>,
    },
    {
      heading: "The Flesch Reading Ease score",
      body: (
        <>
          <pre><code>206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)</code></pre>
          <p>Scores of 60–70 are plain English, readable by most teenagers; 30 or below is very difficult, typical of academic writing. The score is designed for English; syllables are estimated, so treat it as a guide rather than a precise measure. It isn&apos;t meaningful for Hindi or other languages.</p>
        </>
      ),
    },
    {
      heading: "How sentences are detected",
      body: <p>The counter uses the browser&apos;s Unicode sentence segmentation, which handles abbreviations, quotation marks and the Devanagari danda (।) better than splitting on full stops. Very informal text without punctuation may be counted as one long sentence.</p>,
    },
  ],
  faqs: [{ q: "Is a higher readability score always better?", a: "Not always. Technical and legal documents need precise terms. Aim for the simplest wording that keeps the meaning." }],
};

export default content;
