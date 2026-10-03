import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Type or paste your text.", "Check the total characters, with and without spaces.", "Compare against common limits for posts, SMS and search snippets."],
  sections: [
    {
      heading: "What counts as one character?",
      body: (
        <p>
          This counter counts characters the way people see them. An emoji with a skin tone (👍🏽), a flag, or a Devanagari conjunct like &ldquo;क्ष&rdquo; is made of several Unicode code points but shows
          as one character, so it&apos;s counted once. Some platforms count differently — X, for example, counts most emoji as two — so leave a little room near a limit.
        </p>
      ),
    },
    {
      heading: "SMS length and encoding",
      body: (
        <p>
          A standard SMS holds 160 characters from the GSM-7 alphabet. If your message contains any character outside it — Hindi or other Indian scripts, emoji, or curly quotes — the whole message
          switches to Unicode, which holds only 70 characters. Longer messages are split into segments of 153 (GSM-7) or 67 (Unicode) characters, and each segment is billed separately.
        </p>
      ),
    },
    {
      heading: "Search result snippets",
      body: <p>Google doesn&apos;t use a fixed character limit; it truncates titles at about 600 pixels wide (roughly 50–60 characters) and descriptions at about 920 pixels (roughly 150–160 characters) on desktop. Keep the important words at the start.</p>,
    },
  ],
  faqs: [
    { q: "Why does the byte count differ from the character count?", a: "In UTF-8, English letters take 1 byte, Indian scripts usually 3 bytes, and emoji 4 bytes or more. Byte limits matter for databases and some APIs." },
    { q: "Is my text saved?", a: "It's remembered in this browser only and never uploaded." },
  ],
};

export default content;
