import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Add images.", "Enter a width and height, pick a preset, or scale by percentage.", "Keep the aspect ratio locked to avoid stretching.", "Resize and download."],
  sections: [
    {
      heading: "Fit vs exact size",
      body: <p>With the lock on, each image is scaled to fit inside the box you enter, keeping its proportions — a 4000×3000 photo resized to 1920×1080 becomes 1440×1080. With the lock off, images are stretched to exactly the size you enter. For exact sizes without distortion (such as passport photos), <Link href="/tools/image-cropper">crop to the right aspect ratio</Link> first.</p>,
    },
    {
      heading: "Quality",
      body: <p>Downscaling uses high-quality resampling in steps, which avoids the jagged edges and moiré of a single large reduction. Upscaling can&apos;t add detail — enlarged images will look softer.</p>,
    },
    {
      heading: "Photo sizes for Indian applications",
      body: <p>Many forms ask for a photo of 35×45 mm, which at 300 DPI is 413×531 pixels, often with a file-size limit of 20–200 KB. Resize here, then use the <Link href="/tools/image-compressor">image compressor</Link> if the file is still too large. Always check the exact requirements of the portal you&apos;re using.</p>,
    },
  ],
  faqs: [
    { q: "Are my images uploaded?", a: "No. Resizing runs entirely in your browser." },
    { q: "Can I resize many images at once?", a: "Yes. Add as many as you like; all get the same settings and you can download them as a ZIP." },
  ],
};

export default content;
