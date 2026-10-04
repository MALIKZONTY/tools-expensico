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
  example: {
    heading: "Example: a ₹60,000 monthly take-home",
    body: (
      <>
        <p>By the 50/30/20 guideline, this income would split into:</p>
        <ul>
          <li><strong>Needs: ₹30,000</strong> — for example rent ₹18,000, groceries ₹6,000, utilities and phone ₹3,000, health insurance and transport ₹3,000.</li>
          <li><strong>Wants: ₹18,000</strong> — eating out, subscriptions, shopping and weekend plans.</li>
          <li><strong>Savings: ₹12,000</strong> — say a ₹7,000 SIP and ₹5,000 into an emergency fund until it covers 3–6 months of needs.</li>
        </ul>
        <p>
          If rent alone is ₹25,000, needs will pass 50%. The calculator shows each group&apos;s share against its guide line and marks it when needs or wants run over, or when savings fall short.
          Trim wants first and keep savings as close to 20% as you can.
        </p>
      </>
    ),
  },
  faqs: [
    { q: "What does “Unallocated” mean?", a: "Income you haven't assigned to anything yet. Give every rupee a job — usually by adding it to savings — so it doesn't disappear into unplanned spending. If you see “Over budget by” instead, your plan spends more than you earn." },
    { q: "Can I add more than one income?", a: "Yes. Add each income source, such as salary, rent received or freelance work. Use take-home amounts after tax and deductions." },
    { q: "Should EMIs count as needs?", a: "Minimum EMIs on existing loans are needs. Extra payments to clear debt early count as savings, because they improve your net worth." },
    { q: "Where is my budget stored?", a: "Only in this browser's local storage. Nothing is uploaded. Clearing site data or using a different browser will start a fresh budget." },
  ],
};

export default content;
