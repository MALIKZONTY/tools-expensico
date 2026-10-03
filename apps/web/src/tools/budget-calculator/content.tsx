import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["List your monthly take-home income.", "Add each expense and saving, and tag it as a need, a want or savings.", "Compare your split with the 50/30/20 guideline and adjust until nothing is over budget."],
  sections: [
    {
      heading: "The 50/30/20 rule",
      body: (
        <>
          <p>A simple starting point for dividing take-home pay:</p>
          <ul>
            <li><strong>50% needs</strong> — things you must pay: rent or home EMI, groceries, utilities, insurance, minimum loan payments.</li>
            <li><strong>30% wants</strong> — things you choose: eating out, entertainment, shopping, holidays.</li>
            <li><strong>20% savings</strong> — emergency fund, investments, and extra debt repayment.</li>
          </ul>
          <p>In expensive cities, needs often exceed 50%. That&apos;s fine as long as savings stay meaningful — cut wants first.</p>
        </>
      ),
    },
    {
      heading: "Tips for a budget that sticks",
      body: (
        <ul>
          <li>Treat savings as a fixed bill: automate a SIP or RD on payday.</li>
          <li>Build an emergency fund of 3–6 months of needs before investing for long-term goals.</li>
          <li>Track irregular costs (insurance premiums, school fees, festivals) by dividing the annual amount by 12.</li>
          <li>
            Splitting shared costs with flatmates or friends? Use the <Link href="/finance/expense-splitter">expense splitter</Link>.
          </li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Should EMIs count as needs?", a: "Minimum EMIs on existing loans are needs. Extra payments to clear debt early count as savings, because they improve your net worth." },
    { q: "Where is my budget stored?", a: "Only in this browser's local storage. Nothing is uploaded. Clearing site data or using a different browser will start a fresh budget." },
  ],
};

export default content;
