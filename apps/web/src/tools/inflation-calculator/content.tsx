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
    {
      heading: "Inflation and real returns",
      body: (
        <>
          <p>
            What matters for savings is the <strong>real return</strong> — growth after inflation. The exact formula is (1 + return) ÷ (1 + inflation) − 1. A fixed deposit paying 7% with inflation at
            6% gives a real return of about 0.94% a year, before tax. An investment that earns less than inflation loses purchasing power even though the rupee amount grows.
          </p>
          <p>
            A quick mental check is the <strong>rule of 72</strong>: divide 72 by the inflation rate to estimate how long prices take to double. At 6%, prices double in about 12 years — so a monthly
            expense of ₹50,000 today is likely to be around ₹1,00,000 a month by then.
          </p>
        </>
      ),
    },
    {
      heading: "Planning for a goal",
      body: (
        <p>
          Inflation turns today&apos;s prices into the real target for a future goal. A college course costing ₹10,00,000 today would cost about <strong>₹36,42,482</strong> in 15 years if education
          costs rise 9% a year. Plan savings against that future figure, not today&apos;s price, or the goal will be under-funded. The same applies to retirement: ₹50,000 of monthly expenses
          today becomes about ₹1,60,357 a month in 20 years at 6% inflation.
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
    { q: "Which inflation rate should I use?", a: "For general living costs, 5–6% is a reasonable long-term assumption in India. Use a higher rate for costs that historically rise faster, such as education and healthcare. Try a few rates to see the range." },
    { q: "Is the calculation exact?", a: "The formula is exact for a constant rate. Real inflation varies year to year, so treat the result as an estimate for planning rather than a prediction." },
    { q: "Why does this matter for investments?", a: "A deposit earning 7% when inflation is 6% gives a real return of only about 1% a year — and less after tax. Compare returns after inflation, not before." },
  ],
};

export default content;
