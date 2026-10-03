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
      heading: "Office files are ZIPs too",
      body: <p>DOCX, XLSX, PPTX and OpenDocument files are ZIP archives of XML files. Opening one here shows its internal parts — useful for extracting the original images embedded in a Word document.</p>,
    },
  ],
  faqs: [
    { q: "Does it support RAR or 7z?", a: "No, only ZIP-based archives." },
    { q: "Can it open password-protected ZIPs?", a: "No. Encrypted entries can't be extracted here." },
    { q: "Is the archive uploaded?", a: "No. It's read in your browser." },
  ],
};

export default content;
