import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Find the question that matches yours.", "Type your numbers into its boxes.", "The answer updates as you type."],
  sections: [
    {
      heading: "Percentage formulas",
      body: (
        <ul>
          <li><strong>X% of Y</strong> = X ÷ 100 × Y</li>
          <li><strong>A is what % of B</strong> = A ÷ B × 100</li>
          <li><strong>Percentage change</strong> = (new − old) ÷ |old| × 100</li>
          <li><strong>Increase by X%</strong> = value × (1 + X/100); <strong>decrease by X%</strong> = value × (1 − X/100)</li>
          <li><strong>Reverse percentage</strong> (original before an X% increase) = result ÷ (1 + X/100)</li>
        </ul>
      ),
    },
    {
      heading: "Common pitfalls",
      body: (
        <ul>
          <li>A 50% fall followed by a 50% rise doesn&apos;t get you back where you started: 100 → 50 → 75.</li>
          <li>&ldquo;Percent&rdquo; and &ldquo;percentage points&rdquo; differ. A rate moving from 6% to 8% is a 2 percentage-point rise but a 33% increase.</li>
          <li>
            To remove tax or a mark-up, divide rather than subtract — see the <Link href="/finance/gst-calculator">GST calculator</Link>.
          </li>
        </ul>
      ),
    },
  ],
  example: {
    body: (
      <ul>
        <li>15% of 2,400 = 360.</li>
        <li>Marks: 360 out of 2,400 is 15%.</li>
        <li>A price going from ₹80 to ₹100 is a 25% increase; from ₹100 back to ₹80 is a 20% decrease.</li>
      </ul>
    ),
  },
  faqs: [
    { q: "How do I calculate percentage marks?", a: "Divide marks obtained by total marks and multiply by 100. Use the second row: enter your marks and the total." },
    { q: "Why is percentage change undefined from zero?", a: "Any change from zero is an infinite percentage, so the calculator shows a dash. Describe it as an absolute change instead." },
  ],
};

export default content;
