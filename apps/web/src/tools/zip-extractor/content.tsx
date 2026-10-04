import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a .zip file.", "Browse or filter the list of files with their sizes.", "Download the files you need."],
  sections: [
    {
      heading: "Safe extraction",
      body: (
        <>
          <p>Archives can be crafted to harm the computer that opens them. This tool protects you in three ways:</p>
          <ul>
            <li><strong>Zip bombs</strong> — tiny archives that expand to gigabytes — are detected from their declared sizes and refused before anything is extracted.</li>
            <li><strong>Path tricks</strong> like <code>../../file</code> are flagged; files are always downloaded with plain, safe names.</li>
            <li>Nothing is executed. Files are only decompressed when you download them.</li>
          </ul>
        </>
      ),
    },
    {
      heading: "Working with the file list",
      body: (
        <p>
          After opening, you see every file in the archive with its folder path and uncompressed size, plus the total size of everything inside. Type in the filter to find files by name or folder —
          for example <code>.jpg</code> to list only photos. Download any file individually; it&apos;s decompressed only at that moment, so you can take one document out of a large archive without
          extracting everything. Archives up to 500 MB with up to 20,000 entries can be opened.
        </p>
      ),
    },
    {
      heading: "When it helps",
      body: (
        <ul>
          <li>Opening a ZIP on a Chromebook, a work computer where you can&apos;t install software, or a phone.</li>
          <li>Checking what&apos;s inside an attachment before extracting anything to your computer.</li>
          <li>Pulling one file out of a large download without unpacking the whole archive.</li>
        </ul>
      ),
    },
    {
      heading: "Office files are ZIPs too",
      body: <p>DOCX, XLSX, PPTX and OpenDocument files are ZIP archives of XML files. Opening one here shows its internal parts — useful for extracting the original images embedded in a Word document.</p>,
    },
  ],
  faqs: [
    { q: "Does it support RAR or 7z?", a: "No, only ZIP-based archives." },
    { q: "Can it open password-protected ZIPs?", a: "No. Encrypted entries can't be extracted here." },
    { q: "Is the archive uploaded?", a: "No. It's read in your browser." },
    { q: "Can I create a ZIP instead?", a: "Yes. Use the ZIP creator to bundle files into a new archive." },
    { q: "Why was my archive refused?", a: "Either it isn't a valid ZIP, it uses encryption, or it would expand to an unsafe size (more than 2 GB, or an unusually high compression ratio typical of zip bombs)." },
  ],
};

export default content;
