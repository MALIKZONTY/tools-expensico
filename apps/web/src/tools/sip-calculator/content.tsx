import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: [
    "Enter how much you plan to invest every month.",
    "Set an expected annual return and the number of years you'll stay invested.",
    "Optionally add an annual step-up if you plan to raise your SIP as your income grows.",
    "Compare the total invested with the estimated value, and check what that value is worth in today's money.",
  ],
  sections: [
    {
      heading: "What is a SIP?",
      body: (
        <p>
          A Systematic Investment Plan (SIP) invests a fixed amount in a mutual fund at regular intervals, usually monthly. Each instalment buys units at that day&apos;s price, so you buy more units when
          prices are low and fewer when they are high. Over long periods, regular investing and compounding do most of the work.
        </p>
      ),
    },
    {
      heading: "How SIP returns are calculated",
      body: (
        <>
          <pre>
            <code>FV = P × [((1 + r)^n − 1) / r] × (1 + r)</code>
          </pre>
          <ul>
            <li><strong>P</strong>: monthly instalment</li>
            <li><strong>r</strong>: expected annual return ÷ 12 ÷ 100</li>
            <li><strong>n</strong>: number of monthly instalments</li>
          </ul>
          <p>
            The final <code>(1 + r)</code> reflects that each instalment is invested at the start of the month. With a step-up, the calculator simply simulates each month with the higher
            instalment from each new year onward.
          </p>
        </>
      ),
    },
    {
      heading: "Why actual returns will differ",
      body: (
        <ul>
          <li>Market-linked funds don&apos;t grow at a constant rate. A 12% assumption might be 25% one year and −10% the next.</li>
          <li>Your actual return is measured as XIRR, which accounts for the timing of every instalment. Fund factsheets usually show CAGR for lump sums, which isn&apos;t directly comparable.</li>
          <li>Expense ratios, exit loads and capital-gains tax reduce what you take home.</li>
          <li>
            Inflation lowers what the final amount will buy, which is why the calculator also shows the value in today&apos;s money. See the <Link href="/finance/inflation-calculator">inflation calculator</Link> for more.
          </li>
        </ul>
      ),
    },
  ],
  example: {
    body: (
      <>
        <p>₹10,000 a month for 10 years at an assumed 12% a year:</p>
        <ul>
          <li>Total invested: 120 × ₹10,000 = <strong>₹12,00,000</strong></li>
          <li>Estimated value: <strong>₹23,23,391</strong>, so estimated gains are about ₹11.23 lakh.</li>
          <li>With a 10% annual step-up, you invest about ₹19.12 lakh and the estimated value rises to about <strong>₹33.74 lakh</strong>.</li>
        </ul>
      </>
    ),
  },
  faqs: [
    { q: "What return should I assume?", a: "Use a conservative figure. Many planners use 10–12% for diversified equity funds over 10+ years, 7–8% for hybrid funds and 6–7% for debt funds, but past performance doesn't guarantee future returns." },
    { q: "Is SIP better than a lump sum?", a: "A lump sum invested earlier has more time to grow if markets rise steadily. A SIP spreads your entry over time, reducing the risk of investing everything at a market peak, and suits monthly income." },
    { q: "Does the calculator include tax?", a: "No. Gains on equity mutual funds are subject to capital-gains tax when you redeem. Tax depends on the holding period and current rules, so check them before planning withdrawals." },
    { q: "What is a step-up SIP?", a: "A step-up (or top-up) SIP raises your monthly instalment by a fixed percentage each year, typically in line with salary increments. Even small step-ups make a large difference over long periods." },
  ],
};

export default content;
