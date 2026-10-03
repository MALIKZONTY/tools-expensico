import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Enter what your goal costs today and how many years away it is.", "Add anything you've already saved for it.", "Set an expected return and, optionally, adjust the goal for inflation.", "Read how much to save each month."],
  sections: [
    {
      heading: "How the monthly saving is calculated",
      body: (
        <>
          <p>First, existing savings are grown to the goal date. The remaining gap is then divided using the future-value-of-annuity formula:</p>
          <pre>
            <code>Monthly saving = gap × r / ((1 + r)^n − 1)</code>
          </pre>
          <p>where r is the monthly return and n the number of months. With inflation adjustment, the goal grows by <code>(1 + inflation)^years</code> first.</p>
        </>
      ),
    },
    {
      heading: "Matching investments to the goal's timeline",
      body: (
        <ul>
          <li>Under 3 years: savings accounts, FDs, RDs or liquid funds — certainty matters more than return.</li>
          <li>3–7 years: a mix, such as hybrid funds and deposits.</li>
          <li>
            7+ years: equity funds via a <Link href="/finance/sip-calculator">SIP</Link> have historically beaten inflation, with ups and downs along the way.
          </li>
        </ul>
      ),
    },
  ],
  example: {
    body: (
      <ul>
        <li>₹10 lakh in 5 years at 10% a year needs about <strong>₹12,914 a month</strong>.</li>
        <li>If ₹2 lakh is already saved, the requirement falls to about <strong>₹8,664 a month</strong>.</li>
      </ul>
    ),
  },
  faqs: [{ q: "What if the goal is very close?", a: "For goals less than a year away, assume a low or zero return — the calculator then simply divides what's left by the number of months." }],
};

export default content;
