import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a photo (JPG, PNG, WebP or AVIF).", "See its camera, capture settings, dates and — if present — GPS location.", "Download a copy with all metadata removed before sharing it publicly."],
  sections: [
    {
      heading: "What's hidden in your photos",
      body: <p>Phones and cameras store EXIF data inside every photo: the device model, lens, exposure settings, the exact date and time, and often GPS coordinates accurate to a few metres. Editing apps add XMP data; agencies add IPTC captions and copyright. Many social networks strip this when you upload, but files sent by email, chat apps that preserve originals, or cloud links often keep it.</p>,
    },
    {
      heading: "What the viewer shows",
      body: (
        <ul>
          <li><strong>Camera</strong> — make, model, lens and the software that last edited the photo.</li>
          <li><strong>Capture</strong> — when it was taken, shutter speed, aperture, ISO, focal length, flash and white balance.</li>
          <li><strong>Image</strong> — dimensions, orientation, colour space and resolution.</li>
          <li><strong>Author &amp; rights</strong> — artist, copyright, captions and titles added by editing software or agencies.</li>
          <li><strong>Location</strong> — GPS coordinates, if recorded, with a link to view them on a map.</li>
        </ul>
      ),
    },
    {
      heading: "When to check a photo",
      body: (
        <p>
          Before posting a photo of your home, your children or a rental listing; before sending an original file to someone you don&apos;t know; and before publishing images on a website, where
          files are served as-is. Photographers also use the capture details to compare settings between shots, and the dates help sort out photos whose file dates were changed by copying.
        </p>
      ),
    },
    {
      heading: "How removal works",
      body: <p>For JPG and PNG files the metadata segments are cut out of the file directly, so the image itself isn&apos;t re-compressed and looks identical. If a JPG relies on its orientation tag to display the right way up, it is rotated and re-saved at high quality instead, so it doesn&apos;t appear sideways after cleaning. WebP and AVIF files are re-encoded.</p>,
    },
  ],
  faqs: [
    { q: "Is my photo uploaded to read the metadata?", a: "No. The file is read in your browser. The map link only opens if you click it." },
    { q: "Why is there no metadata in my photo?", a: "It may have been removed already — screenshots, images saved from social networks and many edited exports carry little or none. Location is only recorded if location access was on for the camera app." },
    { q: "Does removing metadata reduce quality?", a: "For most JPG and PNG files, no: only the metadata is cut out and the pixels are untouched. WebP, AVIF, and JPGs that need rotating are re-saved at high quality." },
    { q: "Does WhatsApp remove location data?", a: "WhatsApp generally strips EXIF from images sent as photos, but files sent as documents keep their original metadata. Check before sharing." },
  ],
};

export default content;
