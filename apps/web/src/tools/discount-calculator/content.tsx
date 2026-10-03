import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Enter the original (MRP or list) price.", "Enter the discount percentage. Add more rows for offers like “50% + extra 20% off”.", "See the final price, your saving and the effective overall discount."],
  sections: [
    {
      heading: "How discounts are calculated",
      body: (
        <>
          <pre>
            <code>Sale price = price × (1 − d₁/100) × (1 − d₂/100) × …</code>
          </pre>
          <p>Each additional discount applies to the already-reduced price, so stacked discounts are always less than their sum.</p>
        </>
      ),
    },
    {
      heading: "Reading sale offers",
      body: (
        <ul>
          <li>“Flat 50% + extra 20% off” is a 60% discount overall, not 70%.</li>
          <li>“Buy 2 get 1 free” is a 33.3% discount on three items; “buy 1 get 1” is 50%.</li>
          <li>Check whether the discount applies to MRP or to a price that already includes a discount.</li>
        </ul>
      ),
    },
  ],
  example: { body: <p>A ₹2,999 item with 50% off and an extra 20% off: 2,999 × 0.5 × 0.8 = <strong>₹1,199.60</strong>. You save ₹1,799.40, an effective 60% discount.</p> },
  faqs: [
    { q: "Is GST charged before or after the discount?", a: "Retail prices in India (MRP) already include GST, and a discount reduces the price you pay including tax. For B2B invoices, GST is charged on the discounted taxable value — use the tax field for that." },
  ],
};

export default content;
