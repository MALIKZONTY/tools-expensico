import Link from "next/link";
import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose an image.", "Pick an aspect ratio, or keep it free.", "Drag the box and its handles — or type exact pixel values — to frame the crop.", "Download the cropped image."],
  sections: [
    {
      heading: "Precise cropping",
      body: <p>The crop box works in the image&apos;s real pixels, so the values you see are exactly what you&apos;ll get. Drag inside the box to move it, drag the handles to resize, or select the box and use the arrow keys to nudge it one pixel at a time (hold Shift for ten).</p>,
    },
    {
      heading: "Aspect ratios",
      body: <p>Use 1:1 for profile pictures, 4:5 for Instagram portrait posts, 16:9 for video thumbnails and 9:16 for stories and reels. For document photos, choose Passport 35:45 and then resize to the exact pixel size required with the <Link href="/tools/image-resizer">image resizer</Link>.</p>,
    },
  ],
  example: {
    heading: "Example: a profile picture from a group photo",
    body: (
      <p>
        Open the group photo and choose <strong>1:1 Square</strong>. A centred square appears over the photo; drag it over your face and pull a corner handle in until your head and shoulders fill it.
        If the result is 640 × 640 pixels, that&apos;s enough for most profile pictures. Choose JPG at around 90% quality for a small file, or PNG if you need the exact pixels. Download, and the original
        photo is untouched.
      </p>
    ),
  },
  faqs: [
    { q: "Does cropping reduce quality?", a: "Cropping only removes pixels. Saving as PNG keeps the remaining pixels exactly; JPG and WebP re-encode at the quality you choose." },
    { q: "Is my image uploaded?", a: "No. Cropping happens in your browser." },
    { q: "Which output format should I pick?", a: "Same as original is usually right. Choose PNG for screenshots, logos and anything with transparency; JPG for photos where a smaller file matters; WebP for websites. Quality from 50% to 100% applies to JPG and WebP." },
    { q: "What image types can I crop?", a: "JPG, PNG, WebP, GIF, BMP and AVIF, up to 60 MB." },
  ],
};

export default content;
