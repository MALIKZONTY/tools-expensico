import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Start a new list or pick a template (travel, moving, finances, interviews).", "Add, edit and tick off items.", "Use “Uncheck all” to reuse the list next time, or print/copy it."],
  sections: [
    {
      heading: "Checklists vs to-do lists",
      body: <p>A to-do list is for one-off tasks that disappear once done. A checklist is a reusable routine: the same items every time you travel, close the month or onboard someone. Checklists reduce mistakes because you don&apos;t have to remember the steps.</p>,
    },
    {
      heading: "Printing",
      body: <p>Printing hides the buttons and prints a clean list with tick boxes — handy to stick on the fridge or take on a trip.</p>,
    },
  ],
  faqs: [
    { q: "How many checklists can I keep?", a: "As many as you like. They're stored in this browser's local storage." },
    { q: "Are my lists private?", a: "Yes. They never leave your device." },
  ],
};

export default content;
