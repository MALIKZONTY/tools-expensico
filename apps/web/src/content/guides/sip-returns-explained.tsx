import Link from "next/link";

export default function Guide() {
  return (
    <>
      <p>
        A systematic investment plan (SIP) invests a fixed amount in a mutual fund every month. It&apos;s the most popular way Indians invest in markets — but the numbers on SIP calculators are easy to
        misread. Here&apos;s what they actually mean.
      </p>
      <h2>How the future value is calculated</h2>
      <pre><code>FV = P × [((1 + r)^n − 1) / r] × (1 + r)</code></pre>
      <p>
        Each monthly instalment <strong>P</strong> grows for a different length of time: the first for the full period, the last for one month. With an assumed annual return, <strong>r</strong> is the
        monthly rate and <strong>n</strong> the number of instalments. The final <code>(1 + r)</code> assumes you invest at the start of each month.
      </p>
      <h2>An example</h2>
      <table>
        <thead><tr><th>₹10,000 a month for…</th><th>Invested</th><th>Value at 12% a year</th></tr></thead>
        <tbody>
          <tr><td>10 years</td><td>₹12 lakh</td><td>≈ ₹23.2 lakh</td></tr>
          <tr><td>20 years</td><td>₹24 lakh</td><td>≈ ₹99.9 lakh</td></tr>
        </tbody>
      </table>
      <p>Doubling the time doesn&apos;t double the result — it more than quadruples it, because the growth itself keeps growing. Starting early matters more than any other choice.</p>
      <h2>Why your actual returns will differ</h2>
      <p>
        Calculators assume a constant return every month. Real equity funds might gain 30% one year and fall 15% the next. The order of returns matters: a fall near the end of your plan hurts more than
        one at the start, because more money is invested by then. Treat calculator results as a rough guide, and use a conservative rate. At 10% instead of 12%, the 10-year example above grows to about
        ₹20.7 lakh; at 8%, about ₹18.4 lakh.
      </p>
      <h2>XIRR vs CAGR</h2>
      <p>
        Fund factsheets usually quote CAGR — the annual growth rate of a single lump sum. A SIP has many investments made at different times, so its return is measured with XIRR, which weights each
        instalment by how long it was invested. Your app&apos;s &ldquo;returns&rdquo; figure for a SIP is normally XIRR. Comparing a SIP&apos;s XIRR with a fund&apos;s CAGR isn&apos;t like for like.
      </p>
      <h2>Step-up SIPs</h2>
      <p>
        Increasing your SIP each year as your salary rises makes a large difference. With a 10% yearly step-up, ₹10,000 a month for 10 years means investing about ₹19.1 lakh in total, and at 12% the
        estimated value rises to roughly ₹33.7 lakh, compared with ₹23.2 lakh for a flat SIP.
      </p>
      <h2>Don&apos;t forget inflation and tax</h2>
      <p>
        ₹1 crore in 20 years won&apos;t buy what ₹1 crore buys today. At 6% inflation, prices more than triple in 20 years. Gains on equity funds are also subject to capital gains tax when you redeem.
        Check the real value with the <Link href="/finance/inflation-calculator">inflation calculator</Link>.
      </p>
      <h2>Try it</h2>
      <ul>
        <li><Link href="/finance/sip-calculator">SIP calculator</Link> — with step-up and an inflation-adjusted value.</li>
        <li><Link href="/finance/savings-goal-calculator">Savings goal calculator</Link> — work backwards from a target.</li>
        <li><Link href="/finance/compound-interest-calculator">Compound interest calculator</Link> — for lump sums plus monthly additions.</li>
      </ul>
      <p className="text-sm">This guide is general information, not investment advice. Mutual fund investments are subject to market risks.</p>
    </>
  );
}
