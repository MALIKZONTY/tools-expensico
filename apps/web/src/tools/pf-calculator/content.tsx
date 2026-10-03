import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";
import { EPF } from "@/lib/finance/india-tax-rules";

const content: ToolContent = {
  steps: [
    "Enter your monthly basic salary plus dearness allowance (DA).",
    "Enter your age, planned retirement age and current EPF balance (from the EPFO passbook).",
    "Check how your employer calculates PF and whether you're an EPS member.",
    "Adjust the expected salary increase and interest rate to see your projected balance.",
  ],
  sections: [
    {
      heading: "How EPF contributions work",
      body: (
        <ul>
          <li><strong>You</strong> contribute 12% of basic + DA. You may contribute more as Voluntary PF (VPF), which earns the same rate.</li>
          <li><strong>Your employer</strong> also contributes 12%. Of that, 8.33% of wages up to ₹15,000 (at most ₹1,250 a month) goes to the Employees&apos; Pension Scheme (EPS); the rest goes to your EPF account.</li>
          <li>Some employers contribute only on the ₹15,000 statutory wage ceiling (₹1,800 a month in total) rather than your full basic.</li>
          <li>Employees who joined after September 2014 with wages above ₹15,000 are generally not EPS members, so the employer&apos;s whole 12% goes to EPF.</li>
        </ul>
      ),
    },
    {
      heading: "How EPF interest is calculated",
      body: (
        <p>
          EPFO calculates interest on the monthly running balance and credits it once a year. The rate is declared each year by the EPFO board and ratified by the government:{" "}
          <strong>{EPF.interestRatePct}% for {EPF.interestRateYear}</strong>. The calculator assumes the rate you enter stays constant, which it won&apos;t exactly.
        </p>
      ),
    },
    {
      heading: "Tax on EPF",
      body: (
        <p>
          Your contributions qualify for the 80C deduction under the old regime. Interest on employee contributions above ₹2.5 lakh a year is taxable. Withdrawals after five years of continuous
          service are tax-free. See how PF affects your take-home pay with the <Link href="/finance/salary-calculator">salary calculator</Link>.
        </p>
      ),
    },
  ],
  example: {
    body: (
      <>
        <p>Basic ₹30,000 a month, age 30, retiring at 58, ₹2 lakh existing balance, employer on full basic, EPS member, 5% yearly raises, 8.25% interest:</p>
        <ul>
          <li>Monthly: you ₹3,600 → EPF; employer ₹2,350 → EPF and ₹1,250 → EPS.</li>
          <li>Projected balance at 58: about <strong>₹1.50 crore</strong>, of which roughly ₹1.01 crore is interest.</li>
        </ul>
      </>
    ),
  },
  faqs: [
    { q: "Does EPS money show in my PF balance?", a: "No. EPS contributions fund your pension and aren't part of the EPF balance you can withdraw. The calculator shows them separately." },
    { q: "Can I withdraw PF before retirement?", a: "Partial withdrawals are allowed for specific purposes such as housing, education, medical treatment and marriage, subject to EPFO rules. Full withdrawal is possible after two months of unemployment." },
    { q: "What is VPF?", a: "Voluntary Provident Fund lets you contribute more than 12% of basic. It earns the EPF rate, but interest on employee contributions above ₹2.5 lakh a year is taxable." },
  ],
};

export default content;
