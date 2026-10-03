import { CategoryPage, categoryMetadata } from "@/components/tool/category-page";

export const metadata = categoryMetadata("pdf", "PDF Tools — Merge, Split, Compress and Convert PDFs");

export default function Page() {
  return (
    <CategoryPage
      id="pdf"
      groups={[
        { heading: "Organise PDFs", slugs: ["pdf-merge", "pdf-split", "pdf-extract-pages", "pdf-delete-pages", "pdf-rotate"] },
        { heading: "Optimise and inspect", slugs: ["pdf-compress", "pdf-viewer", "pdf-metadata"] },
        { heading: "Convert from PDF", slugs: ["pdf-to-jpg", "pdf-to-png", "pdf-to-webp", "pdf-to-text", "pdf-to-html", "pdf-to-docx"] },
        { heading: "Convert to PDF", slugs: ["jpg-to-pdf", "png-to-pdf", "docx-to-pdf", "xlsx-to-pdf", "pptx-to-pdf"] },
      ]}
    />
  );
}
