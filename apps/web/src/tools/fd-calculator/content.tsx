import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: [
    "Choose cumulative (interest reinvested until maturity) or interest payout.",
    "Enter the deposit amount, the annual rate your bank offers and the tenure.",
    "Select how often interest compounds or is paid out.",
    "Read the maturity value, total interest and effective annual yield.",
  ],
  sections: [
    {
      heading: "How FD interest is calculated",
      body: (
        <>
          <pre>
            <code>A = P × (1 + r / n)^(n × t)</code>
          </pre>
          <p>
            <strong>P</strong> is the deposit, <strong>r</strong> the annual rate as a decimal, <strong>n</strong> the number of times interest compounds per year (4 for quarterly), and{" "}
            <strong>t</strong> the tenure in years. More frequent compounding gives a slightly higher effective yield.
          </p>
        </>
      ),
    },
    {
      heading: "Cumulative vs payout FDs",
      body: (
        <ul>
          <li><strong>Cumulative:</strong> interest is added to the deposit and earns interest itself. You receive everything at maturity. Best when you don&apos;t need regular income.</li>
          <li><strong>Payout (non-cumulative):</strong> interest is paid to your account monthly, quarterly or yearly; the deposit stays the same. Useful for retirees who need regular income.</li>
        </ul>
      ),
    },
    {
      heading: "Things the calculator doesn't model",
      body: (
        <ul>
          <li>Tax: FD interest is added to your income and taxed at your slab rate; TDS may be deducted.</li>
          <li>Premature withdrawal penalties, usually 0.5–1% off the applicable rate.</li>
          <li>Some banks calculate short tenures (under six months) with simple interest; check your bank&apos;s terms.</li>
        </ul>
      ),
    },
  ],
  example: {
    body: (
      <>
        <p>₹1,00,000 at 7% for 5 years, compounded quarterly:</p>
        <ul>
          <li>A = 1,00,000 × (1 + 0.07/4)^20 = <strong>₹1,41,478</strong></li>
          <li>Interest earned: ₹41,478; effective annual yield 7.19%</li>
          <li>With yearly compounding the same deposit grows to ₹1,40,255; with monthly compounding, ₹1,41,763.</li>
        </ul>
      </>
    ),
  },
  faqs: [
    { q: "Why is the effective yield higher than the FD rate?", a: "Because interest compounds during the year. 7% compounded quarterly is equivalent to 7.19% compounded once a year." },
    { q: "Is FD interest taxable?", a: "Yes. It is taxed as income at your slab rate in the year it accrues, even for cumulative FDs. Tax-saver FDs give a deduction on the deposit but have a 5-year lock-in." },
    { q: "Are FDs safe?", a: "Deposits in Indian banks are insured by DICGC up to a statutory limit per depositor per bank (₹5 lakh at the time of writing), covering principal and interest together. Check the current limit on the DICGC website." },
  ],
};

export default content;
