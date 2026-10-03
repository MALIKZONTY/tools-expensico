import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Add one or more images.", "Choose a quality level, an output format and optionally a maximum size.", "Compress and compare the before/after sizes for each image.", "Download images individually or all together as a ZIP."],
  sections: [
    {
      heading: "How image compression works",
      body: <p>JPG and WebP use lossy compression: they discard detail the eye barely notices, controlled by the quality setting. Phone photos are often saved at very high quality and resolution — far more than screens need — so lowering quality slightly and limiting dimensions to 1920–2560px typically cuts file size by 60–90% with no visible difference.</p>,
    },
    {
      heading: "Which format should I choose?",
      body: (
        <ul>
          <li><strong>WebP</strong> — smallest files for websites and apps, supports transparency.</li>
          <li><strong>JPG</strong> — best compatibility for email, documents and upload forms.</li>
          <li><strong>PNG</strong> — lossless; best for screenshots and graphics but rarely smaller. Re-saving a PNG as PNG won&apos;t shrink it much; convert to WebP instead.</li>
        </ul>
      ),
    },
    {
      heading: "We never make your image bigger",
      body: <p>If re-encoding would produce a larger file in the same format (common for images that are already optimised), you get your original back unchanged. Read more in <Link href="/guides/jpg-vs-png-vs-webp">JPG vs PNG vs WebP</Link>.</p>,
    },
  ],
  faqs: [
    { q: "Are my photos uploaded?", a: "No. Compression runs in your browser using its built-in image encoders. Nothing leaves your device." },
    { q: "Is EXIF data kept?", a: "No. Re-encoded images don't carry camera metadata or GPS location, which is good for privacy. Photos are rotated correctly first." },
    { q: "How do I reduce an image to under 100 KB for a form?", a: "Choose JPG, limit dimensions to 1080px and lower the quality until the size fits. Passport-style photos usually need much smaller dimensions — use the image resizer for exact sizes." },
  ],
};

export default content;
