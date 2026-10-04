import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Start a new list or pick a template (travel, moving, finances, interviews).", "Add, edit and tick off items.", "Use “Uncheck all” to reuse the list next time, or print/copy it."],
  sections: [
    {
      heading: "Checklists vs to-do lists",
      body: <p>A to-do list is for one-off tasks that disappear once done. A checklist is a reusable routine: the same items every time you travel, close the month or onboard someone. Checklists reduce mistakes because you don&apos;t have to remember the steps.</p>,
    },
    {
      heading: "Built-in templates",
      body: (
        <ul>
          <li><strong>Travel packing</strong> — ID, tickets, chargers, medicines and the other things people forget.</li>
          <li><strong>Moving house</strong> — updating your address with the bank, Aadhaar and PAN, and transferring the gas connection.</li>
          <li><strong>Monthly finances</strong> — credit card bill, SIP check, rent or EMI, and a review of subscriptions.</li>
          <li><strong>Job interview</strong> — research, resume copies, questions to ask and a tested route or video call.</li>
        </ul>
      ),
    },
    {
      heading: "Making a good checklist",
      body: (
        <p>
          Keep each item short and checkable — “Pay credit card bill”, not “money stuff”. Put items in the order you&apos;ll do them, and only include steps people actually skip; a list of obvious
          steps gets ignored. After each use, add anything you forgot and delete what never matters. Over a few rounds the list becomes a reliable routine you can hand to someone else.
        </p>
      ),
    },
    {
      heading: "Printing",
      body: <p>Printing hides the buttons and prints a clean list with tick boxes — handy to stick on the fridge or take on a trip.</p>,
    },
  ],
  faqs: [
    { q: "How many checklists can I keep?", a: "As many as you like. They're stored in this browser's local storage." },
    { q: "Are my lists private?", a: "Yes. They never leave your device." },
    { q: "Will my checklists be there tomorrow?", a: "Yes, in the same browser on the same device. Clearing your browsing data, or using a private window, removes them. Copy a list as text to keep a backup or move it to another device." },
    { q: "Can I share a checklist?", a: "Use Copy as text and paste it into a message or email, or print it. There's no sharing link because nothing is stored on a server." },
  ],
};

export default content;
