import Link from "next/link";

export default function Guide() {
  return (
    <>
      <p>
        An offer letter says ₹15 lakh, but your monthly bank credit is far less than ₹1.25 lakh. The gap isn&apos;t a mistake: CTC (cost to company) counts everything your employer spends on you, while
        in-hand salary is what&apos;s left after contributions and taxes. Here&apos;s where the difference goes.
      </p>
      <h2>What&apos;s inside CTC</h2>
      <ul>
        <li><strong>Basic salary</strong> — usually 35–50% of CTC. Many other components are calculated from it.</li>
        <li><strong>Allowances</strong> — HRA, special allowance, LTA and others, paid monthly.</li>
        <li><strong>Employer PF contribution</strong> — 12% of basic (or of the ₹15,000 wage ceiling), paid into your EPF account rather than your bank.</li>
        <li><strong>Gratuity</strong> — about 4.81% of basic set aside each year, paid only if you leave after at least five years.</li>
        <li><strong>Variable pay and benefits</strong> — bonuses, insurance premiums and similar items, which may be paid annually or not in cash at all.</li>
      </ul>
      <h2>From CTC to gross salary</h2>
      <p>Subtract the parts that never reach your payslip as cash — employer PF, gratuity and non-cash benefits. What remains is your gross salary.</p>
      <h2>From gross salary to in-hand pay</h2>
      <ul>
        <li><strong>Employee PF</strong> — another 12% of basic, deducted from your salary. It&apos;s your savings, just not available now.</li>
        <li><strong>Professional tax</strong> — a state levy of up to ₹2,500 a year; some states don&apos;t charge it.</li>
        <li><strong>Income tax (TDS)</strong> — deducted monthly by your employer, based on your estimated annual tax.</li>
      </ul>
      <h2>A worked example (FY 2026-27, new regime)</h2>
      <p>CTC ₹15,00,000, basic 40%, employer PF on full basic, gratuity included in CTC, professional tax ₹2,400:</p>
      <table>
        <tbody>
          <tr><td>CTC</td><td>₹15,00,000</td></tr>
          <tr><td>− Employer PF (12% of ₹6,00,000 basic)</td><td>₹72,000</td></tr>
          <tr><td>− Gratuity (4.81% of basic)</td><td>₹28,846</td></tr>
          <tr><td><strong>Gross salary</strong></td><td><strong>₹13,99,154</strong></td></tr>
          <tr><td>− Employee PF</td><td>₹72,000</td></tr>
          <tr><td>− Professional tax</td><td>₹2,400</td></tr>
          <tr><td>− Income tax incl. 4% cess</td><td>₹81,768</td></tr>
          <tr><td><strong>In-hand per year</strong></td><td><strong>₹12,42,986</strong></td></tr>
          <tr><td><strong>In-hand per month</strong></td><td><strong>≈ ₹1,03,582</strong></td></tr>
        </tbody>
      </table>
      <p>
        Tax here is calculated on gross salary minus the ₹75,000 standard deduction (₹13,24,154): nothing on the first ₹4 lakh, 5% on the next ₹4 lakh, 10% on the next ₹4 lakh and 15% on the remaining
        ₹1,24,154, plus 4% cess.
      </p>
      <h2>New regime or old regime?</h2>
      <p>
        The new regime has lower rates, a ₹75,000 standard deduction and a rebate that makes taxable income up to ₹12 lakh tax-free — but it doesn&apos;t allow most deductions. The old regime has
        higher rates but lets you claim HRA exemption, section 80C (up to ₹1.5 lakh including your PF), 80D health insurance, home-loan interest and more.
      </p>
      <p>
        For the same ₹15 lakh CTC, claiming the full ₹1.5 lakh under 80C and ₹25,000 of other deductions under the old regime still results in about ₹1.71 lakh of tax — more than double the new-regime
        figure. The old regime tends to win only with large deductions such as a big HRA exemption or home-loan interest.
      </p>
      <h2>Why your payslip may differ</h2>
      <ul>
        <li>Employers spread tax across the months remaining in the year, so TDS changes when you submit investment proofs or receive a bonus.</li>
        <li>Some employers cap PF at the ₹15,000 wage ceiling (₹1,800 a month), which raises take-home pay but lowers retirement savings.</li>
        <li>Variable pay is usually paid annually, so it isn&apos;t part of your regular monthly credit.</li>
      </ul>
      <p>
        Estimate your own numbers with the <Link href="/finance/salary-calculator">salary calculator</Link>, and see what your PF grows into with the <Link href="/finance/pf-calculator">PF calculator</Link>.
        Tax rules change with each budget, so confirm details with your employer or a tax professional.
      </p>
    </>
  );
}
