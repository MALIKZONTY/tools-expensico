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
      heading: "Built-in presets",
      body: (
        <ul>
          <li><strong>Instagram</strong> — square 1080×1080 and portrait 1080×1350.</li>
          <li><strong>Full HD</strong> — 1920×1080 for slides, wallpapers and video frames.</li>
          <li><strong>WhatsApp/Facebook cover</strong> — 1640×924.</li>
          <li><strong>YouTube thumbnail</strong> — 1280×720.</li>
          <li><strong>Passport photo</strong> — 35×45 mm at 300 DPI (413×531) and <strong>Indian visa photo</strong> — 2×2 inches at 300 DPI (600×600).</li>
        </ul>
      ),
    },
    {
      heading: "Output format and file size",
      body: (
        <p>
          Keep <strong>Same as original</strong> unless you need a particular format. JPG and WebP have a quality slider from 40% to 100%: 80–90% is visually identical for most photos and much
          smaller. PNG is lossless, so it&apos;s best for screenshots and graphics but makes large files from photos. Resized images are re-encoded, so camera details such as location (EXIF data)
          aren&apos;t carried over to the new file.
        </p>
      ),
    },
    {
      heading: "Photo sizes for Indian applications",
      body: <p>Many forms ask for a photo of 35×45 mm, which at 300 DPI is 413×531 pixels, often with a file-size limit of 20–200 KB. Resize here, then use the <Link href="/tools/image-compressor">image compressor</Link> if the file is still too large. Always check the exact requirements of the portal you&apos;re using.</p>,
    },
  ],
  faqs: [
    { q: "Are my images uploaded?", a: "No. Resizing runs entirely in your browser." },
    { q: "Can I resize by percentage?", a: "Yes. Switch from Pixels to Percentage — for example 50% halves both width and height of every image." },
    { q: "Why is my photo sideways after resizing elsewhere but not here?", a: "Phones often save photos sideways with an orientation tag. This tool applies that tag before resizing, so the result is upright in every app." },
    { q: "Can I resize many images at once?", a: "Yes. Add as many as you like; all get the same settings and you can download them as a ZIP." },
  ],
};

export default content;
