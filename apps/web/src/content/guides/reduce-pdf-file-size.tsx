import Link from "next/link";

export default function Guide() {
  return (
    <>
      <p>Upload portals and email often cap attachments at 2, 5 or 10 MB. Here&apos;s why PDFs get large and how to shrink them without making them unreadable.</p>
      <h2>Why PDFs get big</h2>
      <ul>
        <li><strong>Scans and photos.</strong> A scanned page is a full image. Scanning at 600 DPI in colour produces enormous files; 200–300 DPI greyscale is usually plenty for documents.</li>
        <li><strong>High-resolution images</strong> placed in documents straight from a phone camera.</li>
        <li><strong>Embedded fonts</strong> — usually small, but full font files in many styles add up.</li>
        <li><strong>Inefficient structure</strong> from some PDF creators: duplicated resources and uncompressed objects.</li>
      </ul>
      <p>Text itself is tiny. A 100-page text-only report may be under 1 MB, while five scanned pages can be 20 MB.</p>
      <h2>Ways to reduce size, from gentlest to strongest</h2>
      <ol>
        <li><strong>Remove what you don&apos;t need.</strong> Delete blank or unnecessary pages, or split the document and send only the relevant part.</li>
        <li><strong>Lossless optimisation.</strong> Rebuilding the file structure keeps every page identical and text selectable. Savings range from nothing to modest, depending on how the PDF was made.</li>
        <li><strong>Recompress the images inside.</strong> Tools such as Ghostscript downsample and recompress embedded images while keeping text as text. This is the best balance when available.</li>
        <li><strong>Re-render every page as an image.</strong> This gives the biggest reduction for scans, but text becomes part of the image: it can no longer be selected, searched or read by screen readers.</li>
      </ol>
      <h2>Fix the source if you can</h2>
      <p>
        Prevention beats compression. Scan at 200–300 DPI, in greyscale for black-and-white documents. Resize or compress photos before inserting them into Word. When exporting from Word or
        PowerPoint, choose a &ldquo;minimum size&rdquo; or &ldquo;standard&rdquo; option rather than &ldquo;high quality print&rdquo;.
      </p>
      <h2>Check before you submit</h2>
      <p>After compressing, zoom in on the smallest text and any signatures or stamps. Many portals reject documents they can&apos;t read, which is worse than a slightly larger file.</p>
      <h2>Tools</h2>
      <ul>
        <li><Link href="/pdf/pdf-compress">Compress PDF</Link> — lossless and strong modes, with sizes shown.</li>
        <li><Link href="/pdf/pdf-delete-pages">Delete pages</Link> and <Link href="/pdf/pdf-split">Split PDF</Link>.</li>
        <li><Link href="/tools/image-compressor">Image compressor</Link> — shrink photos before making a PDF with <Link href="/convert/jpg-to-pdf">JPG to PDF</Link>.</li>
      </ul>
    </>
  );
}
