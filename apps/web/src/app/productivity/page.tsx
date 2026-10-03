import { CategoryPage, categoryMetadata } from "@/components/tool/category-page";

export const metadata = categoryMetadata("productivity", "Productivity Tools — Notepad, Word Counter, QR Codes and More");

export default function Page() {
  return (
    <CategoryPage
      id="productivity"
      groups={[
        { heading: "Write", slugs: ["notepad", "markdown-editor", "word-counter", "character-counter", "sentence-counter"] },
        { heading: "Transform text", slugs: ["case-converter", "text-formatter", "text-diff", "lorem-ipsum-generator"] },
        { heading: "Generate", slugs: ["qr-code-generator", "password-generator", "uuid-generator"] },
        { heading: "Plan and track", slugs: ["todo-list", "checklist", "date-calculator", "countdown-timer", "timestamp-converter", "percentage-calculator"] },
      ]}
    />
  );
}
