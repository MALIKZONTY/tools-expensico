import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose UUID v4 or v7 and how many you need (up to 1,000).", "Optionally switch to uppercase or remove hyphens.", "Copy or download the list. Paste any UUID below to validate it and see its version."],
  sections: [
    {
      heading: "What is a UUID?",
      body: <p>A UUID (universally unique identifier, also called GUID) is a 128-bit identifier written as 32 hex digits, like <code>550e8400-e29b-41d4-a716-446655440000</code>. They can be generated independently on any machine with a negligible chance of collision, so they&apos;re used as database keys, request IDs and file names.</p>,
    },
    {
      heading: "v4 vs v7",
      body: (
        <ul>
          <li><strong>v4</strong> is 122 random bits. Simple and widely supported.</li>
          <li><strong>v7</strong> (RFC 9562) starts with a millisecond timestamp followed by random bits, so values sort by creation time. That keeps database indexes compact and makes IDs roughly chronological. Its creation time can be read back — don&apos;t use v7 where that leaks information.</li>
        </ul>
      ),
    },
    {
      heading: "Randomness",
      body: <p>UUIDs are generated with your browser&apos;s cryptographically secure random number generator (<code>crypto.getRandomValues</code>), not <code>Math.random()</code>.</p>,
    },
  ],
  faqs: [
    { q: "Can two UUIDs collide?", a: "In theory, yes; in practice, no. You'd need to generate around a billion v4 UUIDs per second for about 86 years to reach a 50% chance of a single collision." },
    { q: "Are UUIDs secret?", a: "No. They're identifiers, not passwords. Use the password generator for secrets." },
  ],
};

export default content;
