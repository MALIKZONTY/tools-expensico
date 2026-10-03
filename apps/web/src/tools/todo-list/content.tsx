import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Type a task and press Enter. Optionally set a priority and due date.", "Tick tasks off as you finish them; overdue tasks are highlighted.", "Your list is saved automatically in this browser."],
  sections: [
    {
      heading: "Keep it simple",
      body: <p>A to-do list works best when it&apos;s quick to update. Tasks sort themselves — high priority first, then by due date — so the next thing to do is always at the top. Click any task&apos;s text to edit it.</p>,
    },
    {
      heading: "Where your tasks live",
      body: <p>Tasks are stored in your browser&apos;s IndexedDB on this device. There&apos;s no account and nothing is uploaded, which also means your list won&apos;t appear on other devices. For lists you reuse — packing, onboarding, weekly routines — try the <Link href="/productivity/checklist">checklist maker</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Will my tasks be there tomorrow?", a: "Yes, in the same browser, unless you clear site data or use private browsing." },
    { q: "Can I share my list?", a: "Not directly. Copy tasks into a message, or use a checklist and its copy/print options." },
  ],
};

export default content;
