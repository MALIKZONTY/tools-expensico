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
      heading: "Viewing controls",
      body: (
        <ul>
          <li><strong>Fit and 100%.</strong> Fit shows the whole image on screen; 100% shows it pixel for pixel, which is the only way to judge sharpness and compression artefacts.</li>
          <li><strong>Zoom.</strong> Zoom from 10% up to 1600% to inspect fine detail such as text in a screenshot or noise in a photo.</li>
          <li><strong>Rotate.</strong> Turns the view in 90° steps for sideways photos. The file itself isn&apos;t changed — to save a rotated copy, use the image resizer or a converter.</li>
          <li><strong>Backgrounds.</strong> Switch between chequered, light and dark backgrounds. A logo that disappears on dark or shows a white box on the checkerboard isn&apos;t truly transparent.</li>
        </ul>
      ),
    },
    {
      heading: "Viewing many images at once",
      body: (
        <p>
          Open a whole folder of photos at once and step through them with the arrow keys or the thumbnail strip. It&apos;s a quick way to pick the right shot from a batch, check that exported images all
          came out at the right size, or look through photos on a computer that has no image viewer installed. Each image can be up to 100 MB.
        </p>
      ),
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
    { q: "Why does my photo look blurry at 100%?", a: "At 100% each image pixel fills one screen pixel. On high-density screens that can look small, and zooming past 100% enlarges pixels so the image looks soft. Blur that's visible at 100% is in the image itself." },
    { q: "Does rotating save the image?", a: "No. Rotation only affects the view here. Your original file is never modified." },
  ],
};

export default content;
