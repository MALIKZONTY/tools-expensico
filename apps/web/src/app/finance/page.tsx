import { CategoryPage, categoryMetadata } from "@/components/tool/category-page";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";

export const metadata = categoryMetadata("finance", "Finance Calculators — EMI, SIP, FD, Salary, GST and More");

export default function Page() {
  return (
    <CategoryPage
      id="finance"
      groups={[
        { heading: "Loans and debt", slugs: ["emi-calculator", "loan-calculator", "debt-payoff-calculator"] },
        { heading: "Savings and investments", slugs: ["sip-calculator", "fd-calculator", "rd-calculator", "compound-interest-calculator", "simple-interest-calculator", "savings-goal-calculator", "inflation-calculator"] },
        { heading: "Salary and tax", slugs: ["salary-calculator", "pf-calculator", "gst-calculator"] },
        { heading: "Everyday money", slugs: ["budget-calculator", "expense-splitter", "percentage-calculator", "discount-calculator"] },
      ]}
    >
      <Alert tone="info" className="mt-6 max-w-3xl">
        Results are estimates to help you plan. Banks and employers may round differently or apply fees and rules not modelled here. See our{" "}
        <Link href="/disclaimer" className="font-medium underline">
          financial disclaimer
        </Link>
        .
      </Alert>
    </CategoryPage>
  );
}
