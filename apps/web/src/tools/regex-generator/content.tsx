import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Browse or filter the patterns.", "Read what the pattern accepts and its limitations.", "Copy it as JavaScript, Python or Java, and try your own values."],
  sections: [
    {
      heading: "Why a pattern library rather than an AI regex generator?",
      body: (
        <p>
          Generated regular expressions often look right but fail on edge cases. Every pattern here comes with examples it must match and must reject, and those examples run as automated tests whenever
          the site is built. You can adapt them in the <Link href="/developer/regex-tester">regex tester</Link>.
        </p>
      ),
    },
    {
      heading: "Validating Indian identifiers",
      body: (
        <p>
          Patterns for PAN, GSTIN, IFSC, PIN codes, mobile numbers and Aadhaar check the <em>format</em> only. A correctly formatted PAN can still be invalid or belong to someone else. Use official
          verification services where it matters, and handle identity numbers carefully — collect them only when you genuinely need them.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Why don't the patterns use \\d in Java?", a: "They do — in Java string literals every backslash must itself be escaped, so \\d becomes \"\\\\d\". The Java snippet does this for you." },
    { q: "Can I use these patterns commercially?", a: "Yes. They're common, generic patterns; use them freely." },
  ],
};

export default content;
