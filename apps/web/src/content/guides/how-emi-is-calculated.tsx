import Link from "next/link";

export default function Guide() {
  return (
    <>
      <p>
        Whether it&apos;s a home loan, car loan or personal loan, most Indian loans are repaid in equated monthly instalments (EMIs). Knowing how the EMI is worked out helps you compare offers,
        choose a sensible tenure and decide whether prepaying is worth it.
      </p>
      <h2>The formula</h2>
      <pre><code>EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)</code></pre>
      <p>
        <strong>P</strong> is the amount borrowed, <strong>r</strong> is the monthly interest rate (annual rate ÷ 12 ÷ 100) and <strong>n</strong> is the number of monthly instalments. This is the
        &ldquo;reducing balance&rdquo; method: each month you pay interest only on the principal still outstanding.
      </p>
      <h2>A worked example</h2>
      <p>Take a ₹10 lakh loan at 8.5% a year for 20 years (240 months). The monthly rate is 8.5 ÷ 12 ÷ 100 = 0.70833%. Plugging in gives an EMI of about <strong>₹8,678</strong>.</p>
      <p>
        In the first month, interest on ₹10 lakh at 0.70833% is ₹7,083, so only ₹1,595 of the EMI reduces the principal. As the balance falls, the interest part shrinks and the principal part
        grows — that&apos;s why the loan balance falls slowly at first and quickly at the end. Over 20 years you pay about ₹20.83 lakh in total, of which ₹10.83 lakh is interest.
      </p>
      <h2>How tenure changes the picture</h2>
      <table>
        <thead>
          <tr><th>Tenure</th><th>EMI</th><th>Total interest</th></tr>
        </thead>
        <tbody>
          <tr><td>10 years</td><td>₹12,399</td><td>₹4.88 lakh</td></tr>
          <tr><td>15 years</td><td>₹9,847</td><td>₹7.73 lakh</td></tr>
          <tr><td>20 years</td><td>₹8,678</td><td>₹10.83 lakh</td></tr>
          <tr><td>25 years</td><td>₹8,052</td><td>₹14.16 lakh</td></tr>
          <tr><td>30 years</td><td>₹7,689</td><td>₹17.68 lakh</td></tr>
        </tbody>
      </table>
      <p className="text-sm">₹10 lakh at 8.5% a year.</p>
      <p>
        Stretching from 20 to 30 years lowers the EMI by under ₹1,000 a month but adds almost ₹7 lakh of interest. A longer tenure is useful if it keeps your EMI comfortable, but it is expensive. A good
        rule is to pick the shortest tenure whose EMI you can pay without strain, then prepay when you can.
      </p>
      <h2>Interest rate changes and floating loans</h2>
      <p>
        Most home loans in India have floating rates linked to an external benchmark such as the RBI repo rate. When rates change, many lenders keep your EMI the same and change the remaining tenure,
        so a rate rise can quietly add years to your loan. Check your loan statement after any rate change and ask your lender to adjust the EMI if the tenure has grown too long.
      </p>
      <h2>Prepayment: the biggest lever you control</h2>
      <p>
        A prepayment goes straight to principal, so every later month&apos;s interest is calculated on a smaller balance. On a ₹20 lakh, 20-year loan at 9%, a single ₹2 lakh prepayment at the end of the
        first year cuts the loan by about 50 months and saves roughly ₹7.1 lakh of interest. Floating-rate home loans to individuals generally carry no prepayment charges.
      </p>
      <h2>Flat rates: read the fine print</h2>
      <p>
        Some personal and vehicle loans quote a &ldquo;flat&rdquo; rate, calculated on the original loan amount for the whole tenure. A 7% flat rate over three to five years is roughly equivalent to a
        12.5–13% reducing-balance rate. Always compare loans on their reducing-balance rate (the APR your lender is required to disclose).
      </p>
      <h2>Try it yourself</h2>
      <ul>
        <li>Use the <Link href="/finance/emi-calculator">EMI calculator</Link> to see your EMI and the full amortization schedule.</li>
        <li>Use the <Link href="/finance/loan-calculator">loan calculator</Link> to find how much you can borrow or how much a prepayment saves.</li>
        <li>Juggling several loans? The <Link href="/finance/debt-payoff-calculator">debt payoff calculator</Link> shows which to clear first.</li>
      </ul>
    </>
  );
}
