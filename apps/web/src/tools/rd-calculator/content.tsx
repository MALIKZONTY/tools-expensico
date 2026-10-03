import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Enter your monthly deposit.", "Enter the RD interest rate offered by your bank or post office.", "Set the tenure in months.", "See the maturity amount and how much of it is interest."],
  sections: [
    {
      heading: "How RD maturity is calculated",
      body: (
        <>
          <p>
            A recurring deposit is a series of small deposits. Each monthly instalment earns interest for the time it stays in the account, and Indian banks compound that interest quarterly.
            The maturity value is the sum of every instalment&apos;s grown value:
          </p>
          <pre>
            <code>M = Σ R × (1 + r/4)^(k/3), for k = 1 … N months</code>
          </pre>
          <p>
            Here R is the monthly deposit, r the annual rate as a decimal and k the number of months each instalment stays invested. This equals the closed form banks publish:{" "}
            <code>M = R × [(1 + i)^n − 1] / [1 − (1 + i)^(−1/3)]</code> with i = r/4 and n = quarters.
          </p>
        </>
      ),
    },
    {
      heading: "RD vs SIP",
      body: (
        <p>
          An RD gives a guaranteed, fixed return and suits short-term goals or very low risk tolerance. A SIP in a mutual fund can earn more over long periods, but returns aren&apos;t guaranteed and can
          be negative in the short term.
        </p>
      ),
    },
  ],
  example: {
    body: (
      <ul>
        <li>₹5,000 a month for 12 months at 6.5%: deposits ₹60,000, maturity <strong>₹62,143</strong>.</li>
        <li>₹5,000 a month for 5 years at 7%: deposits ₹3,00,000, maturity about <strong>₹3,59,664</strong>.</li>
      </ul>
    ),
  },
  faqs: [
    { q: "What happens if I miss an instalment?", a: "Most banks charge a small penalty per missed month, and several missed instalments can lead to the RD being closed. The calculator assumes every instalment is paid on time." },
    { q: "Is RD interest taxable?", a: "Yes, like FD interest it is taxed at your slab rate, and TDS applies above the threshold." },
    { q: "Why does my bank's figure differ slightly?", a: "Banks may round each quarter's interest or count days rather than months. Differences of a few rupees are normal." },
  ],
};

export default content;
