import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";
import { NEW_REGIME, OLD_REGIME, TAX_YEAR_LABEL } from "@/lib/finance/india-tax-rules";

const lakh = (n: number) => (n === Infinity ? "" : `₹${(n / 100_000).toLocaleString("en-IN")} lakh`);

function SlabTable({ slabs }: { slabs: { upTo: number; ratePct: number }[] }) {
  const rows = slabs.map((s, i) => {
    const lower = i === 0 ? 0 : slabs[i - 1].upTo;
    const label = s.upTo === Infinity ? `Above ${lakh(lower)}` : lower === 0 ? `Up to ${lakh(s.upTo)}` : `${lakh(lower)} – ${lakh(s.upTo)}`;
    return { label, ratePct: s.ratePct };
  });
  return (
    <table>
      <thead>
        <tr>
          <th>Taxable income</th>
          <th>Rate</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td>{r.label}</td>
            <td>{r.ratePct === 0 ? "Nil" : `${r.ratePct}%`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const content: ToolContent = {
  steps: [
    "Enter your annual CTC from your offer letter and the share that is basic salary.",
    "Choose how your employer calculates PF and whether gratuity is included in your CTC.",
    "Enter your state's professional tax and choose the new or old tax regime.",
    "Compare the monthly in-hand figure and see which regime leaves you more money.",
  ],
  sections: [
    {
      heading: "Why in-hand salary is lower than CTC",
      body: (
        <>
          <p>CTC (cost to company) is everything an employer spends on you in a year. Part of it never reaches your bank account each month:</p>
          <ul>
            <li><strong>Employer PF</strong> goes into your EPF account — it&apos;s your money, but you receive it later.</li>
            <li><strong>Gratuity</strong> is a provision paid only when you leave after at least five years of service.</li>
            <li><strong>Employee PF</strong> (12% of basic) is deducted from your gross salary.</li>
            <li><strong>Professional tax</strong> is a state levy of up to ₹2,500 a year.</li>
            <li><strong>Income tax (TDS)</strong> is deducted monthly by your employer.</li>
          </ul>
          <p>
            For more detail, read our guide <Link href="/guides/ctc-vs-in-hand-salary">CTC vs in-hand salary</Link>, or project your PF savings with the <Link href="/finance/pf-calculator">PF calculator</Link>.
          </p>
        </>
      ),
    },
    {
      heading: `New tax regime slabs (${TAX_YEAR_LABEL})`,
      body: (
        <>
          <SlabTable slabs={NEW_REGIME.slabs} />
          <p>
            Standard deduction for salaried employees: ₹{NEW_REGIME.standardDeduction.toLocaleString("en-IN")}. A rebate under section 87A makes tax nil if taxable income is up to{" "}
            {lakh(NEW_REGIME.rebateIncomeLimit)}, with marginal relief just above that limit — so a salary of up to about ₹12.75 lakh pays no income tax. Most other deductions (80C, 80D, HRA) are not
            available in the new regime. 4% health and education cess applies on the tax.
          </p>
        </>
      ),
    },
    {
      heading: "Old tax regime slabs (below 60)",
      body: (
        <>
          <SlabTable slabs={OLD_REGIME.slabs.below60} />
          <p>
            Standard deduction ₹{OLD_REGIME.standardDeduction.toLocaleString("en-IN")}; rebate makes tax nil up to {lakh(OLD_REGIME.rebateIncomeLimit)} of taxable income. The old regime allows
            deductions such as 80C (up to ₹1.5 lakh, including your PF), 80D health insurance, HRA exemption and home-loan interest. It usually only wins if you claim large deductions.
          </p>
        </>
      ),
    },
  ],
  example: {
    body: (
      <>
        <p>CTC ₹15 lakh, basic 40%, PF on full basic, gratuity included, professional tax ₹2,400, new regime:</p>
        <ul>
          <li>Basic ₹6,00,000 → employer PF ₹72,000 and gratuity ₹28,846, so gross salary is ₹13,99,154.</li>
          <li>Taxable income = 13,99,154 − 75,000 standard deduction = ₹13,24,154.</li>
          <li>Tax = ₹20,000 + ₹40,000 + 15% of ₹1,24,154 = ₹78,623, plus 4% cess = <strong>₹81,768</strong>.</li>
          <li>In-hand = 13,99,154 − 72,000 PF − 2,400 PT − 81,768 tax = ₹12,42,986 a year, or about <strong>₹1,03,582 a month</strong>.</li>
        </ul>
      </>
    ),
  },
  faqs: [
    { q: "Which tax regime should I choose?", a: "Compare both — the calculator shows the difference. With few deductions the new regime is usually better. The old regime can win if you claim a large HRA exemption, home-loan interest and full 80C/80D deductions." },
    { q: "Why does my payslip show a different TDS each month?", a: "Employers estimate your annual tax and spread it over the remaining months. When you submit investment proofs or receive a bonus, the monthly TDS changes, even if the annual total is similar." },
    { q: "Are bonuses and variable pay included?", a: "If your CTC includes variable pay, that part is paid only when earned, often once a year. Subtract it from CTC to estimate your regular monthly salary." },
    { q: "What about HRA and other allowances?", a: "In the new regime HRA is fully taxable, so it doesn't change the result. In the old regime, add your HRA exemption to “Other deductions & exemptions”." },
  ],
};

export default content;
