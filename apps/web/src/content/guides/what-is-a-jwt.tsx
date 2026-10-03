import Link from "next/link";

export default function Guide() {
  return (
    <>
      <p>JSON Web Tokens (JWTs) are everywhere in modern web apps: you get one when you log in, and your browser sends it with each request. They&apos;re simple, but easy to misuse.</p>
      <h2>Structure</h2>
      <p>A JWT is three Base64URL-encoded parts separated by dots:</p>
      <pre><code>header.payload.signature</code></pre>
      <ul>
        <li><strong>Header</strong> — metadata, mainly the signing algorithm, e.g. <code>{'{"alg":"HS256","typ":"JWT"}'}</code>.</li>
        <li><strong>Payload</strong> — the claims: statements about the user and the token.</li>
        <li><strong>Signature</strong> — computed over the header and payload with a secret or private key.</li>
      </ul>
      <h2>Standard claims</h2>
      <table>
        <tbody>
          <tr><td><code>iss</code></td><td>Issuer — who created the token</td></tr>
          <tr><td><code>sub</code></td><td>Subject — usually the user ID</td></tr>
          <tr><td><code>aud</code></td><td>Audience — which service the token is for</td></tr>
          <tr><td><code>exp</code></td><td>Expiry time (seconds since 1 January 1970, UTC)</td></tr>
          <tr><td><code>nbf</code></td><td>Not valid before this time</td></tr>
          <tr><td><code>iat</code></td><td>Issued at</td></tr>
          <tr><td><code>jti</code></td><td>Unique token ID, useful for revocation</td></tr>
        </tbody>
      </table>
      <h2>Signed, not encrypted</h2>
      <p>
        The payload of a normal JWT is only encoded. Anyone holding the token can decode it — try it in the <Link href="/developer/jwt-decoder">JWT decoder</Link>. The signature prevents tampering,
        not reading. Never put passwords, personal identifiers you wouldn&apos;t show the user, or secrets in a JWT payload. (Encrypted JWTs, called JWE, exist but are much less common.)
      </p>
      <h2>HS256 vs RS256</h2>
      <ul>
        <li><strong>HS256</strong> uses one shared secret to sign and verify. Simple, but every service that verifies tokens can also create them.</li>
        <li><strong>RS256/ES256</strong> sign with a private key and verify with a public key, so services can check tokens without being able to forge them. Public keys are often published at a JWKS URL.</li>
      </ul>
      <h2>Common mistakes</h2>
      <ul>
        <li><strong>Trusting the token&apos;s own alg header.</strong> Servers must enforce the expected algorithm; accepting <code>alg: none</code> or switching RS256 to HS256 has led to real vulnerabilities.</li>
        <li><strong>Not checking exp, aud and iss.</strong> A valid signature isn&apos;t enough.</li>
        <li><strong>Long-lived access tokens.</strong> JWTs are hard to revoke. Keep access tokens short-lived (minutes) and use refresh tokens.</li>
        <li><strong>Weak HMAC secrets.</strong> Use long random secrets; short ones can be brute-forced offline from any captured token.</li>
        <li><strong>Pasting production tokens into online tools that log them.</strong> Use a decoder that runs locally in your browser.</li>
      </ul>
      <h2>Where to store tokens in a browser</h2>
      <p>
        HttpOnly, Secure, SameSite cookies keep tokens out of reach of JavaScript, which limits damage from cross-site scripting, but require CSRF protection. Storing tokens in localStorage is simpler but
        exposes them to any script running on the page. Whichever you choose, a strict Content Security Policy and short token lifetimes help.
      </p>
      <p>
        Related tools: <Link href="/developer/base64-encoder-decoder">Base64 decoder</Link> and the <Link href="/developer/timestamp-converter">Unix timestamp converter</Link> for reading <code>exp</code> and{" "}
        <code>iat</code>.
      </p>
    </>
  );
}
