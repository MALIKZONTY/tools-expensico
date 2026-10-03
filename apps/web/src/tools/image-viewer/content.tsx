import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Open one or more images (JPG, PNG, WebP, GIF, AVIF, BMP, SVG).", "Zoom, fit to screen, rotate, and switch backgrounds to inspect transparency.", "Use the arrow keys or thumbnails to move between images."],
  sections: [
    {
      heading: "Check images before you share them",
      body: <p>See an image&apos;s true pixel dimensions, file size and format — handy before uploading to a form with size limits or printing. The chequered background reveals transparent areas in PNG, WebP and SVG files.</p>,
    },
    {
      heading: "Next steps",
      body: (
        <ul>
          <li>Too big? <Link href="/tools/image-compressor">Compress it</Link> or <Link href="/tools/image-resizer">resize it</Link>.</li>
          <li>Wrong format? Convert <Link href="/convert/webp-to-jpg">WebP to JPG</Link> or <Link href="/convert/png-to-jpg">PNG to JPG</Link>.</li>
          <li>Curious about hidden data? See the <Link href="/tools/image-metadata">EXIF metadata</Link>.</li>
        </ul>
      ),
    },
  ],
  faqs: [
    { q: "Can it open HEIC photos from iPhone?", a: "Most browsers can't decode HEIC. On iPhone, set Camera > Formats to “Most Compatible” to save JPGs, or export the photo as JPEG." },
    { q: "Are my images uploaded?", a: "No. They're displayed directly from your device." },
  ],
};

export default content;
