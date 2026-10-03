import "server-only";
import { getConversion } from "@/lib/convert/catalog";
import { converterContent } from "@/lib/convert/content";
import type { ToolContent } from "./content-types";
import type { ToolMeta } from "./tools";

type Loader = () => Promise<{ default: ToolContent }>;

/**
 * Server-only map of tool slug → long-form content module.
 * Converters are generated from the conversion catalogue instead.
 */
export const CONTENT_LOADERS: Record<string, Loader> = {
  // file tools
  "pdf-viewer": () => import("@/tools/pdf-viewer/content"),
  "csv-viewer": () => import("@/tools/csv-viewer/content"),
  "json-viewer": () => import("@/tools/json-viewer/content"),
  "xml-viewer": () => import("@/tools/xml-viewer/content"),
  "markdown-viewer": () => import("@/tools/markdown-viewer/content"),
  "text-viewer": () => import("@/tools/text-viewer/content"),
  "html-viewer": () => import("@/tools/html-viewer/content"),
  "excel-viewer": () => import("@/tools/excel-viewer/content"),
  "docx-viewer": () => import("@/tools/docx-viewer/content"),
  "image-viewer": () => import("@/tools/image-viewer/content"),
  "image-compressor": () => import("@/tools/image-compressor/content"),
  "image-resizer": () => import("@/tools/image-resizer/content"),
  "image-cropper": () => import("@/tools/image-cropper/content"),
  "image-metadata": () => import("@/tools/image-metadata/content"),
  "file-info": () => import("@/tools/file-info/content"),
  "file-size-converter": () => import("@/tools/file-size-converter/content"),
  "zip-creator": () => import("@/tools/zip-creator/content"),
  "zip-extractor": () => import("@/tools/zip-extractor/content"),
  "file-compare": () => import("@/tools/file-compare/content"),
  // pdf
  "pdf-merge": () => import("@/tools/pdf-merge/content"),
  "pdf-split": () => import("@/tools/pdf-split/content"),
  "pdf-compress": () => import("@/tools/pdf-compress/content"),
  "pdf-rotate": () => import("@/tools/pdf-rotate/content"),
  "pdf-extract-pages": () => import("@/tools/pdf-extract-pages/content"),
  "pdf-delete-pages": () => import("@/tools/pdf-delete-pages/content"),
  "pdf-metadata": () => import("@/tools/pdf-metadata/content"),
  // finance
  "emi-calculator": () => import("@/tools/emi-calculator/content"),
  "sip-calculator": () => import("@/tools/sip-calculator/content"),
  "fd-calculator": () => import("@/tools/fd-calculator/content"),
  "rd-calculator": () => import("@/tools/rd-calculator/content"),
  "simple-interest-calculator": () => import("@/tools/simple-interest-calculator/content"),
  "compound-interest-calculator": () => import("@/tools/compound-interest-calculator/content"),
  "loan-calculator": () => import("@/tools/loan-calculator/content"),
  "salary-calculator": () => import("@/tools/salary-calculator/content"),
  "pf-calculator": () => import("@/tools/pf-calculator/content"),
  "gst-calculator": () => import("@/tools/gst-calculator/content"),
  "percentage-calculator": () => import("@/tools/percentage-calculator/content"),
  "discount-calculator": () => import("@/tools/discount-calculator/content"),
  "inflation-calculator": () => import("@/tools/inflation-calculator/content"),
  "savings-goal-calculator": () => import("@/tools/savings-goal-calculator/content"),
  "budget-calculator": () => import("@/tools/budget-calculator/content"),
  "expense-splitter": () => import("@/tools/expense-splitter/content"),
  "debt-payoff-calculator": () => import("@/tools/debt-payoff-calculator/content"),
  // productivity
  notepad: () => import("@/tools/notepad/content"),
  "markdown-editor": () => import("@/tools/markdown-editor/content"),
  "word-counter": () => import("@/tools/word-counter/content"),
  "character-counter": () => import("@/tools/character-counter/content"),
  "sentence-counter": () => import("@/tools/sentence-counter/content"),
  "case-converter": () => import("@/tools/case-converter/content"),
  "text-formatter": () => import("@/tools/text-formatter/content"),
  "text-diff": () => import("@/tools/text-diff/content"),
  "lorem-ipsum-generator": () => import("@/tools/lorem-ipsum-generator/content"),
  "qr-code-generator": () => import("@/tools/qr-code-generator/content"),
  "password-generator": () => import("@/tools/password-generator/content"),
  "date-calculator": () => import("@/tools/date-calculator/content"),
  "countdown-timer": () => import("@/tools/countdown-timer/content"),
  "todo-list": () => import("@/tools/todo-list/content"),
  checklist: () => import("@/tools/checklist/content"),
  // developer
  "json-formatter": () => import("@/tools/json-formatter/content"),
  "json-validator": () => import("@/tools/json-validator/content"),
  "json-minifier": () => import("@/tools/json-minifier/content"),
  "base64-encoder-decoder": () => import("@/tools/base64-encoder-decoder/content"),
  "url-encoder-decoder": () => import("@/tools/url-encoder-decoder/content"),
  "jwt-decoder": () => import("@/tools/jwt-decoder/content"),
  "uuid-generator": () => import("@/tools/uuid-generator/content"),
  "regex-tester": () => import("@/tools/regex-tester/content"),
  "regex-generator": () => import("@/tools/regex-generator/content"),
  "timestamp-converter": () => import("@/tools/timestamp-converter/content"),
  "cron-expression-generator": () => import("@/tools/cron-expression-generator/content"),
  "sql-formatter": () => import("@/tools/sql-formatter/content"),
  "html-formatter": () => import("@/tools/html-formatter/content"),
  "css-formatter": () => import("@/tools/css-formatter/content"),
  "javascript-formatter": () => import("@/tools/javascript-formatter/content"),
  "yaml-validator": () => import("@/tools/yaml-validator/content"),
  "xml-formatter": () => import("@/tools/xml-formatter/content"),
  "hash-generator": () => import("@/tools/hash-generator/content"),
  "color-converter": () => import("@/tools/color-converter/content"),
  "http-status-codes": () => import("@/tools/http-status-codes/content"),
};

export async function loadToolContent(tool: ToolMeta): Promise<ToolContent> {
  if (tool.kind === "converter" && tool.conversionSlug) {
    const def = getConversion(tool.conversionSlug);
    if (!def) throw new Error(`Missing conversion ${tool.conversionSlug}`);
    return converterContent(def);
  }
  const loader = CONTENT_LOADERS[tool.slug];
  if (!loader) throw new Error(`No content registered for tool "${tool.slug}"`);
  return (await loader()).default;
}
