import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: [
    "List every debt with its balance, interest rate and minimum monthly payment.",
    "Enter the total amount you can put towards debt each month (at least the sum of the minimums).",
    "Choose avalanche or snowball and see your debt-free date, total interest and payoff order.",
  ],
  sections: [
    {
      heading: "Avalanche vs snowball",
      body: (
        <ul>
          <li><strong>Avalanche</strong> puts every spare rupee on the highest-interest debt first. It always costs the least interest and is mathematically optimal.</li>
          <li><strong>Snowball</strong> clears the smallest balance first. It costs a little more, but early wins keep many people motivated, which matters if you might otherwise give up.</li>
        </ul>
      ),
    },
    {
      heading: "How the plan is simulated",
      body: (
        <p>
          Each month, interest is added to every balance, every debt receives its minimum payment, and the rest of your budget goes to the target debt. When a debt is cleared, its minimum payment
          &ldquo;rolls over&rdquo; to the next target, so payments accelerate over time. For a single loan, see the <Link href="/finance/loan-calculator">prepayment calculator</Link>.
        </p>
      ),
    },
  ],
  example: {
    body: (
      <>
        <p>A credit card (₹80,000 at 36%), a personal loan (₹1,50,000 at 14%) and a bike loan (₹40,000 at 11%), with ₹20,000 a month:</p>
        <ul>
          <li>Avalanche: debt-free in 16 months with about ₹31,673 of interest.</li>
          <li>Snowball: also 16 months, but about ₹36,351 of interest — roughly ₹4,700 more.</li>
        </ul>
      </>
    ),
  },
  faqs: [
    { q: "Should I invest or pay off debt first?", a: "Clearing debt with a rate higher than you can reliably earn — credit cards at 30–40% especially — is usually the best guaranteed return available. Keep a small emergency fund so you don't borrow again." },
    { q: "Is my data saved?", a: "Your debts are stored only in this browser so you can come back to them. Nothing is uploaded." },
  ],
};

export default content;
