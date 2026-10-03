import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose Text or File.", "Type text or select a file — all five hashes are calculated at once.", "To check a download, paste the publisher's checksum into the verify box."],
  sections: [
    {
      heading: "What is a hash?",
      body: <p>A cryptographic hash function turns any input into a fixed-length fingerprint. The same input always gives the same hash, and changing a single bit changes the hash completely. That makes hashes ideal for checking that a file downloaded correctly or hasn&apos;t been tampered with.</p>,
    },
    {
      heading: "Which algorithm should I use?",
      body: (
        <ul>
          <li><strong>SHA-256</strong> — the standard choice for checksums and integrity checks.</li>
          <li><strong>SHA-384 / SHA-512</strong> — longer outputs, used in some security protocols and subresource integrity.</li>
          <li><strong>SHA-1 and MD5</strong> — broken for security (collisions can be manufactured), but still used as quick checksums by older systems. Never use them for passwords or signatures.</li>
        </ul>
      ),
    },
    {
      heading: "Hashing isn't encryption — or password storage",
      body: <p>A hash can&apos;t be reversed, but fast hashes like SHA-256 are unsuitable for storing passwords because attackers can try billions of guesses per second. Use a dedicated password hash such as Argon2, scrypt or bcrypt.</p>,
    },
  ],
  example: { body: <p>The SHA-256 of the empty string is <code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>; the MD5 of <code>abc</code> is <code>900150983cd24fb0d6963f7d28e17f72</code>.</p> },
  faqs: [
    { q: "Why doesn't my text hash match another tool?", a: "Check for invisible differences: a trailing newline, Windows (CRLF) vs Unix (LF) line endings, or a different text encoding." },
    { q: "Is my file uploaded?", a: "No. Hashing runs in your browser using the Web Crypto API (SHA family) and a local MD5 implementation." },
  ],
};

export default content;
