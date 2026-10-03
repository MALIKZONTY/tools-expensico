import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose whether you want a future cost or today's value of a future amount.", "Enter the amount, an average inflation rate and the number of years."],
  sections: [
    {
      heading: "Formulas",
      body: (
        <ul>
          <li><strong>Future cost</strong> = cost today × (1 + inflation)^years</li>
          <li><strong>Present value</strong> = future amount ÷ (1 + inflation)^years</li>
        </ul>
      ),
    },
    {
      heading: "Choosing an inflation rate",
      body: (
        <p>
          India&apos;s consumer price inflation has typically ranged between about 4% and 7% a year over the last decade, and the RBI targets 4% with a band of 2–6%. For long-term goals many planners use 6%;
          for education or healthcare goals, 8–10% is more realistic. Use the result with the <Link href="/finance/savings-goal-calculator">savings goal calculator</Link> to plan how much to save.
        </p>
      ),
    },
  ],
  example: {
    body: (
      <ul>
        <li>Something costing ₹1,00,000 today will cost about <strong>₹1,79,085</strong> in 10 years at 6% inflation.</li>
        <li>₹1,00,000 received 10 years from now is worth only about <strong>₹55,839</strong> in today&apos;s money.</li>
      </ul>
    ),
  },
  faqs: [
    { q: "Why does this matter for investments?", a: "A deposit earning 7% when inflation is 6% gives a real return of only about 1% a year — and less after tax. Compare returns after inflation, not before." },
  ],
};

export default content;
