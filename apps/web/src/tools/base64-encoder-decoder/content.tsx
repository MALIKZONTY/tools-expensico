import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose Text or File.", "For text, pick Encode or Decode and type or paste your input.", "For files, choose a file to get its Base64 or a data URL.", "Copy or download the result."],
  sections: [
    {
      heading: "What is Base64?",
      body: (
        <p>
          Base64 represents binary data using 64 printable characters (A–Z, a–z, 0–9, + and /). It lets images, files and binary tokens travel through systems that only handle text — JSON, email,
          URLs, environment variables. It is an <strong>encoding, not encryption</strong>: anyone can decode it.
        </p>
      ),
    },
    {
      heading: "Base64 vs Base64URL",
      body: (
        <p>
          Standard Base64 uses <code>+</code>, <code>/</code> and <code>=</code> padding, which have special meanings in URLs. Base64URL replaces them with <code>-</code> and <code>_</code> and usually drops
          the padding. JWTs use Base64URL. The decoder here accepts both.
        </p>
      ),
    },
    {
      heading: "Unicode text",
      body: <p>Text is converted to UTF-8 bytes before encoding, so Indian scripts, emoji and symbols like ₹ round-trip correctly — unlike the browser&apos;s raw <code>btoa()</code>, which fails on them.</p>,
    },
  ],
  example: { body: <p><code>hello</code> encodes to <code>aGVsbG8=</code>. Every 3 bytes become 4 characters, so Base64 is about 33% larger than the original.</p> },
  faqs: [
    { q: "Should I embed images as Base64?", a: "Only small ones such as icons. A data URL is a third larger than the file and can't be cached separately by the browser." },
    { q: "Is my file uploaded?", a: "No. Encoding and decoding run in your browser." },
  ],
};

export default content;
