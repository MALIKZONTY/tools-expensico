import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose Add GST (price excludes tax) or Remove GST (price includes tax).", "Enter the amount and pick a GST rate.", "Choose intra-state or inter-state supply to see the CGST/SGST or IGST split."],
  sections: [
    {
      heading: "GST rates in India",
      body: (
        <>
          <p>
            Since 22 September 2025 (&ldquo;GST 2.0&rdquo;), most goods and services fall into a simpler structure: <strong>5%</strong> for essentials and many everyday items, <strong>18%</strong> as the standard
            rate, and <strong>40%</strong> for a small set of luxury and &ldquo;sin&rdquo; goods. Many essentials are nil-rated, and a few special rates remain — for example 3% on gold and 0.25% on rough
            diamonds. The previous 12% and 28% slabs were removed for most items.
          </p>
          <p>Rates depend on the exact HSN/SAC classification, so always confirm the rate for your item.</p>
        </>
      ),
    },
    {
      heading: "Formulas",
      body: (
        <ul>
          <li><strong>Adding GST:</strong> GST = amount × rate / 100; total = amount + GST.</li>
          <li><strong>Removing GST:</strong> taxable value = total × 100 / (100 + rate); GST = total − taxable value.</li>
        </ul>
      ),
    },
    {
      heading: "CGST, SGST and IGST",
      body: (
        <p>
          For a sale within one state, GST is split equally between the Centre (CGST) and the state (SGST, or UTGST in union territories). For a sale between states — or imports — the full amount is
          charged as IGST. The total tax is the same either way.
        </p>
      ),
    },
  ],
  example: {
    body: (
      <ul>
        <li>Add 18% GST to ₹1,000: GST ₹180 (CGST ₹90 + SGST ₹90), total ₹1,180.</li>
        <li>Remove 18% GST from ₹1,180: taxable value = 1,180 × 100 / 118 = ₹1,000; GST ₹180.</li>
        <li>A common mistake is taking 18% of ₹1,180 (₹212.40) — that overstates the tax.</li>
      </ul>
    ),
  },
  faqs: [
    { q: "Why can't I just subtract 18% from a GST-inclusive price?", a: "Because the 18% was calculated on the pre-tax amount, not the total. Use total × 100 / (100 + rate) to find the pre-tax value." },
    { q: "Does the 12% or 28% rate still exist?", a: "For most goods they were merged into 5% and 18% from 22 September 2025, with a new 40% rate for selected luxury and sin goods. You can still enter any custom rate if you need it, for example for older invoices." },
  ],
};

export default content;
