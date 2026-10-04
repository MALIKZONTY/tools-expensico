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
      heading: "When you'd use it",
      body: (
        <ul>
          <li>Previewing an HTML email template at phone width before sending a campaign.</li>
          <li>Opening a web page someone saved with “Save page as” and sent to you.</li>
          <li>Reading an HTML report or export (test results, bank statements, analytics exports) safely.</li>
          <li>Checking an HTML attachment you weren&apos;t expecting — the sandbox stops it from running code or phoning home.</li>
        </ul>
      ),
    },
    {
      heading: "Device widths",
      body: (
        <p>
          The phone and tablet buttons resize the preview to 390 and 820 pixels wide — typical modern phone and tablet viewports — so you can see whether a layout is responsive. Desktop uses the full
          width available. In Source view the markup is formatted with Prettier for reading; Copy and Download give you that formatted HTML. Files up to 20 MB can be opened.
        </p>
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
    { q: "Do links in the page work?", a: "No. Navigation is disabled inside the preview so a page can't redirect you or open other sites. Read the link addresses in Source view instead." },
    { q: "Is it safe to allow remote images and styles?", a: "Scripts stay blocked either way. Allowing remote resources only lets the page load images, fonts and stylesheets from the internet, which means those servers can see that the file was opened." },
  ],
};

export default content;
