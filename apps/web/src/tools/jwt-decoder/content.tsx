import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste a JWT (with or without the “Bearer ” prefix).", "Read the decoded header and payload, plus human-readable dates for exp, iat and nbf.", "Optionally verify an HMAC signature with the shared secret."],
  sections: [
    {
      heading: "What's inside a JWT",
      body: (
        <>
          <p>A JSON Web Token has three Base64URL-encoded parts separated by dots:</p>
          <ol>
            <li><strong>Header</strong> — the signing algorithm (<code>alg</code>) and token type.</li>
            <li><strong>Payload</strong> — the claims: who the token is about (<code>sub</code>), who issued it (<code>iss</code>), when it expires (<code>exp</code>) and any custom data.</li>
            <li><strong>Signature</strong> — proves the header and payload weren&apos;t changed by someone without the key.</li>
          </ol>
          <p>
            Read more in our guide <Link href="/guides/what-is-a-jwt">What is a JWT?</Link>
          </p>
        </>
      ),
    },
    {
      heading: "Decoding isn't verification",
      body: (
        <p>
          Anyone can decode a JWT — the payload is only encoded, not encrypted. Never put secrets in a JWT payload, and never trust a token on the server without verifying its signature with the
          expected algorithm and key.
        </p>
      ),
    },
    {
      heading: "Privacy",
      body: <p>Tokens often grant access to real accounts. This decoder runs entirely in your browser; the token and any secret you enter are never transmitted or stored.</p>,
    },
  ],
  faqs: [
    { q: "Why does my token show as expired?", a: "The exp claim (seconds since 1 January 1970, UTC) is earlier than your device's current time. Check that your clock is correct, too." },
    { q: "Can it verify RS256 tokens?", a: "Not currently. RS256 and ES256 need the issuer's public key (often from a JWKS URL); this tool verifies only shared-secret HMAC tokens." },
  ],
};

export default content;
