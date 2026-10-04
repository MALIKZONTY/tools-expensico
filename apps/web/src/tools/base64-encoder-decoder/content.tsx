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
    {
      heading: "Encoding files and decoding to files",
      body: (
        <>
          <p>
            Switch to <strong>File → Base64</strong> to turn any file up to 20 MB into Base64. Tick <em>Include data URL prefix</em> to get a ready-to-use value such as <code>data:image/png;base64,…</code>{" "}
            for an <code>&lt;img&gt;</code> tag or a CSS background.
          </p>
          <p>
            When you decode Base64 that turns out to be binary — an image, a PDF or a ZIP rather than text — the tool recognises the file type from its contents and offers it as a download instead
            of showing unreadable characters. That&apos;s handy for attachments pasted from an API response or an email&apos;s source.
          </p>
        </>
      ),
    },
    {
      heading: "Where you'll meet Base64",
      body: (
        <ul>
          <li>HTTP Basic authentication headers (<code>Authorization: Basic …</code>), which are just Base64 of <code>username:password</code>.</li>
          <li>Kubernetes secrets and other configuration that stores binary values as text.</li>
          <li>The header and payload of a JWT — use the JWT decoder to read those directly.</li>
          <li>Email attachments, which travel as Base64 inside the message source.</li>
        </ul>
      ),
    },
  ],
  example: { body: <p><code>hello</code> encodes to <code>aGVsbG8=</code>. Every 3 bytes become 4 characters, so Base64 is about 33% larger than the original.</p> },
  faqs: [
    { q: "Should I embed images as Base64?", a: "Only small ones such as icons. A data URL is a third larger than the file and can't be cached separately by the browser." },
    { q: "Is my file uploaded?", a: "No. Encoding and decoding run in your browser." },
    { q: "Why does decoding fail?", a: "The input contains characters that aren't part of Base64, or it was cut off. Check for missing characters at the end and stray spaces or quotes copied with it." },
    { q: "Is Base64 safe for passwords?", a: "No. Base64 hides nothing — anyone can decode it in a second. Use proper encryption or a secrets manager for anything sensitive." },
  ],
};

export default content;
