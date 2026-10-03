import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Start typing — there's nothing to set up.", "Your text saves automatically a moment after you stop typing.", "Come back later in the same browser and it will be there.", "Download as .txt, copy, or move it into Notes to keep it alongside others."],
  sections: [
    {
      heading: "Where your text is saved",
      body: (
        <p>
          The notepad stores your text in this browser&apos;s IndexedDB storage on your device. It isn&apos;t uploaded or synced. That means it&apos;s private, but it also means it won&apos;t appear on
          your phone if you wrote it on your laptop, and it will be lost if you clear this site&apos;s data or use a private window. Download anything important.
        </p>
      ),
    },
    {
      heading: "Notepad or Notes?",
      body: (
        <p>
          The notepad is a single scratch page — perfect for jotting things down quickly. <Link href="/notes">Notes</Link> keeps as many separate notes as you like, with titles, pinning, search and trash.
          Use “Save to Notes” to move a draft over.
        </p>
      ),
    },
  ],
  faqs: [
    { q: "Do I need an account?", a: "No. There are no accounts; the notepad works as soon as the page loads." },
    { q: "Will my text survive closing the browser?", a: "Yes, in the same browser on the same device, unless you clear site data or browse privately." },
    { q: "Is there a size limit?", a: "Browsers typically allow hundreds of megabytes for IndexedDB, far more than any notepad needs." },
  ],
};

export default content;
