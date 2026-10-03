import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Enter a starting amount and, optionally, a monthly contribution.", "Set the annual interest rate, number of years and compounding frequency.", "Review the future value, total interest and the year-by-year table."],
  sections: [
    {
      heading: "The compound interest formula",
      body: (
        <>
          <pre>
            <code>A = P × (1 + r/n)^(n × t)</code>
          </pre>
          <p>
            P is the initial amount, r the annual rate as a decimal, n the compounding periods per year and t the years. Compound interest (CI) is <code>A − P</code>. With regular contributions, each
            month&apos;s balance grows at the monthly rate equivalent to your chosen compounding frequency, then the contribution is added.
          </p>
        </>
      ),
    },
    {
      heading: "Why compounding frequency matters (a little)",
      body: (
        <p>
          The more often interest compounds, the higher the effective annual rate: 10% compounded yearly is 10%, but compounded monthly it is 10.47%. The difference is real but small compared with the
          effect of the rate itself and, above all, time.
        </p>
      ),
    },
    {
      heading: "The rule of 72",
      body: <p>Divide 72 by the annual rate to estimate how many years it takes money to double. At 8% that&apos;s about 9 years; at 12%, about 6 years.</p>,
    },
  ],
  example: {
    body: (
      <ul>
        <li>₹1,00,000 at 10% compounded yearly for 10 years grows to <strong>₹2,59,374</strong>.</li>
        <li>Compounded monthly instead, it grows to <strong>₹2,70,704</strong>.</li>
        <li>Adding ₹5,000 every month (monthly compounding) brings the total to about <strong>₹12.95 lakh</strong>, of which ₹7 lakh is your own money.</li>
      </ul>
    ),
  },
  faqs: [
    { q: "What's the difference between simple and compound interest?", a: "Simple interest is calculated only on the original principal. Compound interest is also calculated on interest already earned, so growth accelerates over time." },
    { q: "Can I use other currencies?", a: "Yes. Choose a currency to change the formatting; the maths is the same in any currency." },
  ],
};

export default content;
