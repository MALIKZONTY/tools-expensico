import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: [
    "Choose a question: how much you can borrow, how long repayment will take, or how much a prepayment saves.",
    "Enter the values that apply — EMI budget, loan amount, rate and tenure.",
    "For prepayments, add a lump sum (and the month you'll pay it) and/or a fixed extra amount every month.",
  ],
  sections: [
    {
      heading: "How much loan can I afford?",
      body: (
        <>
          <p>Inverting the EMI formula gives the principal a given EMI can support:</p>
          <pre>
            <code>P = EMI × ((1 + r)^n − 1) / (r × (1 + r)^n)</code>
          </pre>
          <p>
            Lenders typically cap total EMIs at 40–50% of your net monthly income, and they also assess your credit score, job stability and other obligations. Leave room for emergencies — the
            maximum a bank will lend is not necessarily what you should borrow.
          </p>
        </>
      ),
    },
    {
      heading: "How long will repayment take?",
      body: (
        <>
          <pre>
            <code>n = −log(1 − r × P / EMI) / log(1 + r)</code>
          </pre>
          <p>If the EMI is less than the first month&apos;s interest (P × r), the loan would never be repaid, and the calculator tells you so.</p>
        </>
      ),
    },
    {
      heading: "Why prepaying early saves so much",
      body: (
        <p>
          Early in a loan most of each EMI is interest. Any prepayment goes straight to principal, so every following month&apos;s interest is calculated on a smaller balance. The earlier the prepayment,
          the more months benefit. Use the <Link href="/finance/emi-calculator">EMI calculator</Link> to see the full amortization schedule.
        </p>
      ),
    },
  ],
  example: {
    body: (
      <ul>
        <li>An EMI of ₹30,000 at 9% for 20 years supports a loan of about <strong>₹33.3 lakh</strong>.</li>
        <li>A ₹20 lakh loan at 9% repaid at ₹25,000 a month takes <strong>123 months</strong> (10 years 3 months).</li>
        <li>
          A ₹20 lakh, 20-year loan at 9% has an EMI of ₹17,995 and total interest of about ₹23.2 lakh. A single ₹2 lakh prepayment in month 12 cuts the tenure to 190 months and saves roughly{" "}
          <strong>₹7.1 lakh</strong> of interest.
        </li>
      </ul>
    ),
  },
  faqs: [
    { q: "Should I reduce EMI or tenure after a prepayment?", a: "Reducing tenure saves more interest. Reducing the EMI improves monthly cash flow. If you can afford the current EMI, keep it and shorten the tenure." },
    { q: "Are there prepayment charges?", a: "RBI rules don't allow foreclosure or prepayment penalties on floating-rate loans to individual borrowers for non-business purposes. Fixed-rate and business loans may carry charges — check your loan agreement." },
  ],
};

export default content;
