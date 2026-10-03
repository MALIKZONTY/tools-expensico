import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose to encode a component, encode a full URL, or decode.", "Paste your text or URL.", "Copy the result. Full URLs are also broken into protocol, host, path and query parameters."],
  sections: [
    {
      heading: "What is URL encoding?",
      body: (
        <p>
          URLs can only contain a limited set of ASCII characters. Anything else — spaces, &amp;, ?, #, non-English letters, emoji — must be percent-encoded as <code>%</code> followed by the hexadecimal
          value of each UTF-8 byte. A space becomes <code>%20</code>, and ₹ becomes <code>%E2%82%B9</code>.
        </p>
      ),
    },
    {
      heading: "Component vs full URL",
      body: (
        <ul>
          <li><strong>Encode component</strong> (<code>encodeURIComponent</code>) escapes everything that has meaning in a URL, including <code>/ ? &amp; = #</code>. Use it for individual query values.</li>
          <li><strong>Encode full URL</strong> (<code>encodeURI</code>) keeps the URL&apos;s structure characters intact and only escapes what&apos;s invalid. Use it for a complete URL that contains spaces or Unicode.</li>
        </ul>
      ),
    },
  ],
  example: {
    body: (
      <p>
        Encoding the component <code>pdf to jpg&amp;fast</code> gives <code>pdf%20to%20jpg%26fast</code>, so the <code>&amp;</code> can&apos;t be mistaken for the start of another parameter.
      </p>
    ),
  },
  faqs: [
    { q: "Why do some URLs use + for spaces?", a: "HTML forms encode spaces in query strings as +. The decoder treats + as a space; when encoding, %20 is used, which works everywhere." },
    { q: "What does “malformed URI sequence” mean?", a: "The input contains a % that isn't followed by two hex digits, or a byte sequence that isn't valid UTF-8. Check for stray % signs." },
  ],
};

export default content;
