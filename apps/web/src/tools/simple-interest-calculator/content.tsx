import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose what you want to find: interest, principal, rate or time.", "Fill in the other three values.", "Read the answer and the formula with your numbers substituted."],
  sections: [
    {
      heading: "The simple interest formula",
      body: (
        <>
          <pre>
            <code>SI = P × R × T / 100</code>
          </pre>
          <p>P is the principal, R the annual rate in percent and T the time in years. The total amount repaid or received is <code>A = P + SI</code>. Rearranging gives the other three:</p>
          <ul>
            <li><code>P = SI × 100 / (R × T)</code></li>
            <li><code>R = SI × 100 / (P × T)</code></li>
            <li><code>T = SI × 100 / (P × R)</code></li>
          </ul>
        </>
      ),
    },
    {
      heading: "Simple vs compound interest",
      body: (
        <p>
          Simple interest is charged only on the original principal, so it grows in a straight line. Compound interest is charged on the principal plus interest already added, so it accelerates.
          Most bank deposits and loans use compound interest; simple interest is common in short informal loans, some car loans quoted at &ldquo;flat&rdquo; rates and textbook problems. Compare them with the{" "}
          <Link href="/finance/compound-interest-calculator">compound interest calculator</Link>.
        </p>
      ),
    },
  ],
  example: { body: <p>₹50,000 at 8% a year for 3 years: SI = 50,000 × 8 × 3 / 100 = <strong>₹12,000</strong>, so the total amount is ₹62,000.</p> },
  faqs: [
    { q: "How do I enter months or days?", a: "Convert to years: 18 months is 1.5 years, 90 days is 90/365 ≈ 0.2466 years." },
    { q: "Is a flat-rate loan the same as simple interest?", a: "Yes. A flat rate charges interest on the full original amount for the whole tenure, even though you repay principal monthly, so its true (reducing-balance) cost is much higher than the quoted rate." },
  ],
};

export default content;
