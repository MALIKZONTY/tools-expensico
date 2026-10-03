import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste the original text on the left and the changed text on the right.", "Read the highlighted differences — changed words are marked within each line.", "Optionally ignore case or whitespace differences."],
  sections: [
    {
      heading: "How the comparison works",
      body: <p>The diff uses the Myers algorithm — the same approach as <code>git diff</code> — to find the smallest set of line insertions and deletions that turns one text into the other. For lines that changed, a second word-level diff highlights exactly which words differ.</p>,
    },
    {
      heading: "Uses",
      body: (
        <ul>
          <li>Comparing two versions of a contract, policy or essay</li>
          <li>Checking what changed between two configuration files or API responses</li>
          <li>Reviewing edits someone made to your text</li>
        </ul>
      ),
    },
    {
      heading: "Comparing files",
      body: <p>To compare two files directly — including checking whether binary files are byte-for-byte identical — use <Link href="/tools/file-compare">File Compare</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Why does a moved paragraph show as deleted and added?", a: "Line diffs don't track moves; a paragraph that moved appears as a deletion in one place and an insertion in another." },
    { q: "Is there a size limit?", a: "Texts of tens of thousands of lines work. Extremely different large texts are shown as a full replacement to keep the browser responsive." },
  ],
};

export default content;
