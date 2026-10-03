import Link from "next/link";

export default function Guide() {
  return (
    <>
      <p>Choosing the wrong image format makes files needlessly large or visibly blurry. The right choice depends on what&apos;s in the image and where it&apos;s going.</p>
      <h2>The short answer</h2>
      <table>
        <thead><tr><th>Use</th><th>Best format</th></tr></thead>
        <tbody>
          <tr><td>Photos for email, forms and documents</td><td>JPG</td></tr>
          <tr><td>Screenshots, logos, diagrams, text</td><td>PNG (or lossless WebP)</td></tr>
          <tr><td>Anything on a website</td><td>WebP (or AVIF)</td></tr>
          <tr><td>Logos and icons that must scale</td><td>SVG</td></tr>
        </tbody>
      </table>
      <h2>JPG</h2>
      <p>
        JPG uses lossy compression designed for photographs: it throws away fine detail the eye is unlikely to notice. Photos compress very well, and every device and app can open JPGs. The downsides:
        no transparency, visible artefacts around sharp edges and text, and a little quality loss every time a JPG is edited and re-saved.
      </p>
      <h2>PNG</h2>
      <p>
        PNG is lossless — the decoded image is exactly what was saved — and supports full transparency. That makes it ideal for screenshots, interface graphics and anything with text or hard edges.
        For photos, though, PNG files are usually several times larger than a good-quality JPG.
      </p>
      <h2>WebP</h2>
      <p>
        WebP, developed by Google, supports both lossy and lossless compression plus transparency. Google&apos;s published comparisons found lossy WebP files 25–34% smaller than JPGs of similar quality,
        and lossless WebP about a quarter smaller than PNG. All modern browsers support it, which makes it the default choice for websites. Some older desktop software and upload forms still don&apos;t.
      </p>
      <h2>AVIF</h2>
      <p>AVIF, based on the AV1 video codec, compresses even better than WebP, especially at lower quality settings. It&apos;s supported by current browsers, but encoding is slower and support in other software is still patchy.</p>
      <h2>SVG</h2>
      <p>SVG isn&apos;t a grid of pixels at all; it describes shapes mathematically, so it stays sharp at any size and is usually tiny. It&apos;s ideal for logos and icons, but not for photos.</p>
      <h2>Common mistakes</h2>
      <ul>
        <li><strong>Saving photos as PNG</strong> — huge files with no visible benefit.</li>
        <li><strong>Saving screenshots as low-quality JPG</strong> — blurry text and smudges around edges.</li>
        <li><strong>Converting JPG to PNG to “improve quality”</strong> — it preserves the current quality but can&apos;t restore what was lost.</li>
        <li><strong>Uploading full-resolution camera photos</strong> — a 12-megapixel photo is far bigger than any screen needs. Resize first.</li>
      </ul>
      <h2>Convert and optimise</h2>
      <ul>
        <li><Link href="/tools/image-compressor">Image compressor</Link> — reduce size with a quality slider and optional resizing.</li>
        <li><Link href="/convert/png-to-jpg">PNG to JPG</Link>, <Link href="/convert/jpg-to-webp">JPG to WebP</Link>, <Link href="/convert/png-to-webp">PNG to WebP</Link>, <Link href="/convert/webp-to-jpg">WebP to JPG</Link>.</li>
      </ul>
    </>
  );
}
