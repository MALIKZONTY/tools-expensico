import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: [
    "Add everyone in the group.",
    "For each expense, enter what it was, the amount, who paid and who shared it.",
    "Read the “Settle up” list: the payments needed to make everyone even.",
    "Copy the summary and share it in your group chat.",
  ],
  sections: [
    {
      heading: "How the settlement is worked out",
      body: (
        <>
          <p>
            For every expense, the payer is credited with the full amount and each person sharing it is debited their equal share. Shares are calculated to the paisa, and any leftover paisa is
            assigned so the totals always balance exactly.
          </p>
          <p>
            Then the largest debtor pays the largest creditor, repeatedly, until everyone is at zero. This produces at most one fewer payment than the number of people — far fewer than everyone
            paying everyone back for each bill.
          </p>
        </>
      ),
    },
    {
      heading: "Uneven splits",
      body: <p>If someone shouldn&apos;t share an expense (they skipped a dinner, say), untick them for that expense. To split unevenly — for example by nights stayed — enter the expense in parts shared by different groups.</p>,
    },
  ],
  example: {
    body: (
      <p>
        Asha pays ₹9,000 for the hotel shared by all three; Ravi pays ₹1,000 for a cab shared with Meera. Asha should get back ₹6,000; Ravi owes ₹2,500 and Meera ₹3,500. Settle up: Meera pays Asha ₹3,500 and
        Ravi pays Asha ₹2,500 — two payments.
      </p>
    ),
  },
  faqs: [
    { q: "Does everyone need an account?", a: "No. There are no accounts. The group is saved in your browser; share the copied summary with others." },
    { q: "Can I use it across devices?", a: "Not automatically — the data lives only in this browser. Copy the summary to share the final result." },
  ],
};

export default content;
