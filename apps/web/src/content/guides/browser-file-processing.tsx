import Link from "next/link";
import { processorConfig } from "@/config/site";

export default function Guide() {
  return (
    <>
      <p>
        Expensico tools say &ldquo;Runs in your browser — your files are never uploaded.&rdquo; Here&apos;s what that means technically, why it&apos;s more private, and which jobs genuinely need a
        server.
      </p>
      <h2>Traditional online converters</h2>
      <p>
        Most online converters upload your file to their server, convert it there and send the result back. Your document — a bank statement, an ID card, a contract — sits on someone else&apos;s computer,
        at least for a while, and you have to trust what they do with it.
      </p>
      <h2>How in-browser processing works</h2>
      <p>
        Modern browsers can run substantial software. When you open a tool page, your browser downloads the tool&apos;s code — JavaScript and sometimes WebAssembly — and runs it on your own device. When you
        choose a file, the browser hands its contents to that code directly from your disk. The conversion happens in your device&apos;s memory, and the result is offered back to you as a download.
      </p>
      <p>Some of the open-source engines involved:</p>
      <ul>
        <li><strong>PDF.js</strong> (from Mozilla) to read and render PDF pages.</li>
        <li><strong>pdf-lib</strong> to merge, split and rotate PDFs.</li>
        <li><strong>SheetJS</strong> to read and write Excel files.</li>
        <li><strong>Mammoth</strong> to convert Word documents to clean HTML.</li>
        <li>The browser&apos;s own image decoders and encoders for JPG, PNG and WebP.</li>
      </ul>
      <h2>How you can check</h2>
      <p>
        You can verify this yourself. Open your browser&apos;s developer tools (F12), switch to the Network tab and run a conversion: you&apos;ll see the tool&apos;s code being loaded, but your file isn&apos;t sent
        anywhere. After a page has loaded, many tools even keep working with your internet connection switched off.
      </p>
      <h2>Jobs that genuinely need a server</h2>
      {processorConfig.enabled ? (
        <p>
          A few jobs need software that can&apos;t practically run in a browser. Converting a Word, Excel or PowerPoint file to PDF with its exact layout requires a full office suite such as
          LibreOffice. For these, Expensico uses a dedicated processing server. Those tools are clearly marked as uploading files, ask you to confirm, use an encrypted connection, and delete your
          file as soon as the conversion finishes.
        </p>
      ) : (
        <p>
          A few jobs need software that can&apos;t practically run in a browser. Converting a Word, Excel or PowerPoint file to PDF with its exact layout requires a full office suite such as
          LibreOffice. Rather than offer a lower-quality browser version, Expensico doesn&apos;t provide those conversions at the moment — every tool on the site runs in your browser. If we add them,
          they will run on a dedicated server, be clearly marked as uploading files, and delete your file as soon as the conversion finishes.
        </p>
      )}
      <h2>Limits of in-browser processing</h2>
      <ul>
        <li><strong>Memory:</strong> very large files are limited by your device&apos;s memory, especially on phones.</li>
        <li><strong>Speed:</strong> processing uses your device&apos;s processor, so older phones may be slower.</li>
        <li><strong>Formats:</strong> some formats, such as iPhone HEIC photos, aren&apos;t supported by most browsers.</li>
      </ul>
      <p>
        For most everyday tasks — <Link href="/convert/pdf-to-jpg">PDF to JPG</Link>, <Link href="/tools/image-compressor">compressing images</Link>, <Link href="/pdf/pdf-merge">merging PDFs</Link>,{" "}
        <Link href="/tools/csv-viewer">viewing spreadsheets</Link> — your browser is more than capable, and your files never have to leave your hands.
      </p>
    </>
  );
}
