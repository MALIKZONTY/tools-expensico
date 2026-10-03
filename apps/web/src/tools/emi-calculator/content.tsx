import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: [
    "Pick a loan type to start from typical values, or enter your own.",
    "Enter the loan amount, the annual interest rate quoted by your lender, and the tenure in years or months.",
    "Read your monthly EMI, total interest and total repayment instantly.",
    "Scroll to the amortization schedule to see how each payment splits between principal and interest, and download it as CSV.",
  ],
  sections: [
    {
      heading: "What is an EMI?",
      body: (
        <p>
          An EMI (equated monthly instalment) is the fixed amount you pay your lender every month until a loan is fully repaid. Each EMI has two parts: interest on the amount you still owe,
          and a repayment of the principal. The EMI stays the same, but the split changes over time — early payments are mostly interest, later ones are mostly principal.
        </p>
      ),
    },
    {
      heading: "The EMI formula",
      body: (
        <>
          <pre>
            <code>EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)</code>
          </pre>
          <ul>
            <li>
              <strong>P</strong> is the loan amount (principal).
            </li>
            <li>
              <strong>r</strong> is the monthly interest rate: the annual rate ÷ 12 ÷ 100. For 8.5% a year, r = 0.0070833.
            </li>
            <li>
              <strong>n</strong> is the number of monthly instalments: 20 years = 240.
            </li>
          </ul>
          <p>
            This is the standard reducing-balance formula used by Indian banks and NBFCs: interest is charged each month only on the principal that is still outstanding.
          </p>
        </>
      ),
    },
    {
      heading: "What changes your EMI",
      body: (
        <ul>
          <li>
            <strong>Loan amount:</strong> EMI rises in direct proportion. Borrowing 10% more means a 10% higher EMI.
          </li>
          <li>
            <strong>Interest rate:</strong> even small differences add up over long tenures. On a ₹50 lakh, 20-year loan, going from 8.5% to 9% raises the EMI by about ₹1,600 and total interest by roughly ₹3.8 lakh.
          </li>
          <li>
            <strong>Tenure:</strong> a longer tenure lowers the EMI but sharply increases total interest. Choose the shortest tenure whose EMI you can comfortably afford.
          </li>
          <li>
            <strong>Floating rates:</strong> most home loans are linked to an external benchmark such as the repo rate. When the rate changes, lenders usually adjust the tenure first and the EMI second. Use the{" "}
            <Link href="/finance/loan-calculator">loan calculator</Link> to see how prepayments shorten a loan.
          </li>
        </ul>
      ),
    },
    {
      heading: "Reading the amortization schedule",
      body: (
        <p>
          The schedule lists every payment with its interest, principal and the balance left afterwards. Notice how slowly the balance falls in the first few years of a long loan — that is why
          prepaying early saves the most interest. If you have several loans, the <Link href="/finance/debt-payoff-calculator">debt payoff calculator</Link> shows which to clear first.
        </p>
      ),
    },
  ],
  example: {
    heading: "Worked example",
    body: (
      <>
        <p>A ₹10,00,000 loan at 8.5% a year for 20 years:</p>
        <ul>
          <li>r = 8.5 ÷ 12 ÷ 100 = 0.0070833; n = 240</li>
          <li>(1 + r)^240 = 5.4412</li>
          <li>EMI = 10,00,000 × 0.0070833 × 5.4412 ÷ (5.4412 − 1) = <strong>₹8,678</strong></li>
          <li>Total paid = 8,678 × 240 ≈ ₹20.83 lakh, so total interest ≈ <strong>₹10.83 lakh</strong> — more than the amount borrowed.</li>
        </ul>
      </>
    ),
  },
  faqs: [
    { q: "Is the EMI shown here exactly what my bank will charge?", a: "It will be very close for a standard reducing-balance loan. Banks may round differently, charge a broken-period interest for the first month, or add processing fees and insurance, so treat the result as a planning estimate." },
    { q: "Does a lower EMI mean a cheaper loan?", a: "Not necessarily. A lower EMI usually comes from a longer tenure, which increases the total interest you pay. Compare the total payment, not just the EMI." },
    { q: "How does a flat interest rate compare?", a: "Some personal and vehicle loans quote a flat rate charged on the original principal for the whole tenure. A flat rate of 7% roughly equals a reducing rate of about 12–13%, so always compare loans using the reducing-balance rate." },
    { q: "Can I calculate EMI for a tenure in months?", a: "Yes. Switch the tenure unit to Months to enter any number of monthly instalments, for example 18 months." },
  ],
};

export default content;
