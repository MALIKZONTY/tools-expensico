import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open an .html file — a saved web page, an email template or an export.", "Preview it at desktop, tablet or phone width.", "Switch to Source to read the formatted markup."],
  sections: [
    {
      heading: "Safe previews of untrusted HTML",
      body: (
        <>
          <p>HTML files from unknown sources can contain scripts or tracking pixels. The preview runs in a sandboxed frame with all permissions removed: no JavaScript, no form submissions, no pop-ups, no navigation, and no access to this site.</p>
          <p>By default a content security policy also blocks remote images, stylesheets and fonts, so opening the file doesn&apos;t tell anyone you looked at it. Tick “Load remote images and styles” to see the page as designed.</p>
        </>
      ),
    },
    {
      heading: "Related tools",
      body: <p>Tidy messy markup with the <Link href="/developer/html-formatter">HTML formatter</Link>, or pull out just the words with <Link href="/convert/html-to-text">HTML to Text</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Why does the page look broken?", a: "Pages saved from websites often depend on scripts or external files. Scripts never run here, and remote files only load if you allow them." },
    { q: "Is my file uploaded?", a: "No. It's displayed from your device." },
  ],
};

export default content;
