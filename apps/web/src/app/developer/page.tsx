import { CategoryPage, categoryMetadata } from "@/components/tool/category-page";

export const metadata = categoryMetadata("developer", "Developer Tools — JSON, JWT, Regex, Base64, SQL Formatter");

export default function Page() {
  return (
    <CategoryPage
      id="developer"
      groups={[
        { heading: "JSON and data", slugs: ["json-formatter", "json-validator", "json-minifier", "json-viewer", "yaml-validator", "xml-formatter"] },
        { heading: "Code formatters", slugs: ["sql-formatter", "html-formatter", "css-formatter", "javascript-formatter"] },
        { heading: "Encoding and security", slugs: ["base64-encoder-decoder", "url-encoder-decoder", "jwt-decoder", "hash-generator", "password-generator", "uuid-generator"] },
        { heading: "Patterns and time", slugs: ["regex-tester", "regex-generator", "cron-expression-generator", "timestamp-converter"] },
        { heading: "Reference", slugs: ["http-status-codes", "color-converter", "text-diff"] },
      ]}
    />
  );
}
