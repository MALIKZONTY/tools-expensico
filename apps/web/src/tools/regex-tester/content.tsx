import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Type your pattern (without the surrounding slashes).", "Tick the flags you need.", "Paste test text — matches are highlighted and listed with their capture groups.", "Optionally preview a find-and-replace."],
  sections: [
    {
      heading: "Which regex flavour is this?",
      body: (
        <p>
          The tester uses your browser&apos;s JavaScript (ECMAScript) regular-expression engine, including named groups <code>(?&lt;name&gt;…)</code>, lookbehind, Unicode property escapes{" "}
          <code>\p{"{"}L{"}"}</code> with the <code>u</code> flag, and the <code>s</code> (dotAll) flag. Results match what <code>String.prototype.match</code> and <code>replace</code> do in Node.js and browsers.
          Most patterns also work in Python, Java and PCRE, but details like lookbehind support and escaping can differ. Need a starting point? Browse the{" "}
          <Link href="/developer/regex-generator">regex pattern library</Link>.
        </p>
      ),
    },
    {
      heading: "Protection against runaway patterns",
      body: (
        <p>
          Some patterns take exponential time on certain inputs — for example <code>(a+)+$</code> on a long string of a&apos;s followed by a b. The tester runs every pattern in a background worker and
          stops it after 1.5 seconds, so a bad pattern can&apos;t freeze your browser. If you see the timeout, the same pattern could cause a ReDoS vulnerability in your application.
        </p>
      ),
    },
    {
      heading: "Quick reference",
      body: (
        <table>
          <tbody>
            <tr><td><code>\d \w \s</code></td><td>digit, word character, whitespace</td></tr>
            <tr><td><code>. </code></td><td>any character except newline (unless the s flag is set)</td></tr>
            <tr><td><code>* + ? {"{n,m}"}</code></td><td>quantifiers; add ? for lazy (e.g. <code>.*?</code>)</td></tr>
            <tr><td><code>^ $ \b</code></td><td>start, end, word boundary</td></tr>
            <tr><td><code>[abc] [^abc]</code></td><td>character class, negated class</td></tr>
            <tr><td><code>(…) (?:…) (?&lt;n&gt;…)</code></td><td>capturing, non-capturing, named group</td></tr>
            <tr><td><code>(?=…) (?!…) (?&lt;=…)</code></td><td>lookahead, negative lookahead, lookbehind</td></tr>
          </tbody>
        </table>
      ),
    },
  ],
  faqs: [
    { q: "Why does ^ only match the first line?", a: "Without the m (multiline) flag, ^ and $ match only at the very start and end of the text. Turn on Multiline to match at every line." },
    { q: "Where can I find ready-made patterns?", a: "The Regex pattern library has tested patterns for emails, URLs, Indian mobile numbers, PIN codes, PAN, GSTIN and more." },
  ],
};

export default content;
