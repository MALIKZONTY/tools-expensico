import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a photo (JPG, PNG, WebP or AVIF).", "See its camera, capture settings, dates and — if present — GPS location.", "Download a copy with all metadata removed before sharing it publicly."],
  sections: [
    {
      heading: "What's hidden in your photos",
      body: <p>Phones and cameras store EXIF data inside every photo: the device model, lens, exposure settings, the exact date and time, and often GPS coordinates accurate to a few metres. Editing apps add XMP data; agencies add IPTC captions and copyright. Many social networks strip this when you upload, but files sent by email, chat apps that preserve originals, or cloud links often keep it.</p>,
    },
    {
      heading: "How removal works",
      body: <p>For JPG and PNG files the metadata segments are cut out of the file directly, so the image itself isn&apos;t re-compressed and looks identical. If a JPG relies on its orientation tag to display the right way up, it is rotated and re-saved at high quality instead, so it doesn&apos;t appear sideways after cleaning. WebP and AVIF files are re-encoded.</p>,
    },
  ],
  faqs: [
    { q: "Is my photo uploaded to read the metadata?", a: "No. The file is read in your browser. The map link only opens if you click it." },
    { q: "Does WhatsApp remove location data?", a: "WhatsApp generally strips EXIF from images sent as photos, but files sent as documents keep their original metadata. Check before sharing." },
  ],
};

export default content;
