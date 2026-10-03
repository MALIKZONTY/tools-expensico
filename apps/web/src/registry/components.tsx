"use client";

/**
 * Client-side map of tool slug → lazily loaded UI. Each entry becomes its own JS chunk,
 * so a page only downloads the code for the tool it shows.
 */

import { useEffect, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/progress";
import { ToolErrorBoundary } from "@/components/tool/ToolErrorBoundary";
import { track } from "@/lib/analytics";

function loading() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6" aria-busy="true" aria-label="Loading tool">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}

const ConverterTool = dynamic(() => import("@/tools/converter/ConverterTool"), { loading });

export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "pdf-viewer": dynamic(() => import("@/tools/pdf-viewer/Tool"), { loading }),
  "csv-viewer": dynamic(() => import("@/tools/csv-viewer/Tool"), { loading }),
  "json-viewer": dynamic(() => import("@/tools/json-viewer/Tool"), { loading }),
  "xml-viewer": dynamic(() => import("@/tools/xml-viewer/Tool"), { loading }),
  "markdown-viewer": dynamic(() => import("@/tools/markdown-viewer/Tool"), { loading }),
  "text-viewer": dynamic(() => import("@/tools/text-viewer/Tool"), { loading }),
  "html-viewer": dynamic(() => import("@/tools/html-viewer/Tool"), { loading }),
  "excel-viewer": dynamic(() => import("@/tools/excel-viewer/Tool"), { loading }),
  "docx-viewer": dynamic(() => import("@/tools/docx-viewer/Tool"), { loading }),
  "image-viewer": dynamic(() => import("@/tools/image-viewer/Tool"), { loading }),
  "image-compressor": dynamic(() => import("@/tools/image-compressor/Tool"), { loading }),
  "image-resizer": dynamic(() => import("@/tools/image-resizer/Tool"), { loading }),
  "image-cropper": dynamic(() => import("@/tools/image-cropper/Tool"), { loading }),
  "image-metadata": dynamic(() => import("@/tools/image-metadata/Tool"), { loading }),
  "file-info": dynamic(() => import("@/tools/file-info/Tool"), { loading }),
  "file-size-converter": dynamic(() => import("@/tools/file-size-converter/Tool"), { loading }),
  "zip-creator": dynamic(() => import("@/tools/zip-creator/Tool"), { loading }),
  "zip-extractor": dynamic(() => import("@/tools/zip-extractor/Tool"), { loading }),
  "file-compare": dynamic(() => import("@/tools/file-compare/Tool"), { loading }),
  "pdf-merge": dynamic(() => import("@/tools/pdf-merge/Tool"), { loading }),
  "pdf-split": dynamic(() => import("@/tools/pdf-split/Tool"), { loading }),
  "pdf-compress": dynamic(() => import("@/tools/pdf-compress/Tool"), { loading }),
  "pdf-rotate": dynamic(() => import("@/tools/pdf-rotate/Tool"), { loading }),
  "pdf-extract-pages": dynamic(() => import("@/tools/pdf-extract-pages/Tool"), { loading }),
  "pdf-delete-pages": dynamic(() => import("@/tools/pdf-delete-pages/Tool"), { loading }),
  "pdf-metadata": dynamic(() => import("@/tools/pdf-metadata/Tool"), { loading }),
  "emi-calculator": dynamic(() => import("@/tools/emi-calculator/Tool"), { loading }),
  "sip-calculator": dynamic(() => import("@/tools/sip-calculator/Tool"), { loading }),
  "fd-calculator": dynamic(() => import("@/tools/fd-calculator/Tool"), { loading }),
  "rd-calculator": dynamic(() => import("@/tools/rd-calculator/Tool"), { loading }),
  "simple-interest-calculator": dynamic(() => import("@/tools/simple-interest-calculator/Tool"), { loading }),
  "compound-interest-calculator": dynamic(() => import("@/tools/compound-interest-calculator/Tool"), { loading }),
  "loan-calculator": dynamic(() => import("@/tools/loan-calculator/Tool"), { loading }),
  "salary-calculator": dynamic(() => import("@/tools/salary-calculator/Tool"), { loading }),
  "pf-calculator": dynamic(() => import("@/tools/pf-calculator/Tool"), { loading }),
  "gst-calculator": dynamic(() => import("@/tools/gst-calculator/Tool"), { loading }),
  "percentage-calculator": dynamic(() => import("@/tools/percentage-calculator/Tool"), { loading }),
  "discount-calculator": dynamic(() => import("@/tools/discount-calculator/Tool"), { loading }),
  "inflation-calculator": dynamic(() => import("@/tools/inflation-calculator/Tool"), { loading }),
  "savings-goal-calculator": dynamic(() => import("@/tools/savings-goal-calculator/Tool"), { loading }),
  "budget-calculator": dynamic(() => import("@/tools/budget-calculator/Tool"), { loading }),
  "expense-splitter": dynamic(() => import("@/tools/expense-splitter/Tool"), { loading }),
  "debt-payoff-calculator": dynamic(() => import("@/tools/debt-payoff-calculator/Tool"), { loading }),
  "notepad": dynamic(() => import("@/tools/notepad/Tool"), { loading }),
  "markdown-editor": dynamic(() => import("@/tools/markdown-editor/Tool"), { loading }),
  "word-counter": dynamic(() => import("@/tools/word-counter/Tool"), { loading }),
  "character-counter": dynamic(() => import("@/tools/character-counter/Tool"), { loading }),
  "sentence-counter": dynamic(() => import("@/tools/sentence-counter/Tool"), { loading }),
  "case-converter": dynamic(() => import("@/tools/case-converter/Tool"), { loading }),
  "text-formatter": dynamic(() => import("@/tools/text-formatter/Tool"), { loading }),
  "text-diff": dynamic(() => import("@/tools/text-diff/Tool"), { loading }),
  "lorem-ipsum-generator": dynamic(() => import("@/tools/lorem-ipsum-generator/Tool"), { loading }),
  "qr-code-generator": dynamic(() => import("@/tools/qr-code-generator/Tool"), { loading }),
  "password-generator": dynamic(() => import("@/tools/password-generator/Tool"), { loading }),
  "date-calculator": dynamic(() => import("@/tools/date-calculator/Tool"), { loading }),
  "countdown-timer": dynamic(() => import("@/tools/countdown-timer/Tool"), { loading }),
  "todo-list": dynamic(() => import("@/tools/todo-list/Tool"), { loading }),
  "checklist": dynamic(() => import("@/tools/checklist/Tool"), { loading }),
  "json-formatter": dynamic(() => import("@/tools/json-formatter/Tool"), { loading }),
  "json-validator": dynamic(() => import("@/tools/json-validator/Tool"), { loading }),
  "json-minifier": dynamic(() => import("@/tools/json-minifier/Tool"), { loading }),
  "base64-encoder-decoder": dynamic(() => import("@/tools/base64-encoder-decoder/Tool"), { loading }),
  "url-encoder-decoder": dynamic(() => import("@/tools/url-encoder-decoder/Tool"), { loading }),
  "jwt-decoder": dynamic(() => import("@/tools/jwt-decoder/Tool"), { loading }),
  "uuid-generator": dynamic(() => import("@/tools/uuid-generator/Tool"), { loading }),
  "regex-tester": dynamic(() => import("@/tools/regex-tester/Tool"), { loading }),
  "regex-generator": dynamic(() => import("@/tools/regex-generator/Tool"), { loading }),
  "timestamp-converter": dynamic(() => import("@/tools/timestamp-converter/Tool"), { loading }),
  "cron-expression-generator": dynamic(() => import("@/tools/cron-expression-generator/Tool"), { loading }),
  "sql-formatter": dynamic(() => import("@/tools/sql-formatter/Tool"), { loading }),
  "html-formatter": dynamic(() => import("@/tools/html-formatter/Tool"), { loading }),
  "css-formatter": dynamic(() => import("@/tools/css-formatter/Tool"), { loading }),
  "javascript-formatter": dynamic(() => import("@/tools/javascript-formatter/Tool"), { loading }),
  "yaml-validator": dynamic(() => import("@/tools/yaml-validator/Tool"), { loading }),
  "xml-formatter": dynamic(() => import("@/tools/xml-formatter/Tool"), { loading }),
  "hash-generator": dynamic(() => import("@/tools/hash-generator/Tool"), { loading }),
  "color-converter": dynamic(() => import("@/tools/color-converter/Tool"), { loading }),
  "http-status-codes": dynamic(() => import("@/tools/http-status-codes/Tool"), { loading }),
};

export function ToolMount({ slug, conversionSlug }: { slug: string; conversionSlug?: string }) {
  useEffect(() => {
    track("tool_opened", { tool: slug });
  }, [slug]);

  const Tool = conversionSlug ? null : TOOL_COMPONENTS[slug];
  return (
    <ToolErrorBoundary slug={slug}>
      {conversionSlug ? <ConverterTool conversionSlug={conversionSlug} /> : Tool ? <Tool /> : null}
    </ToolErrorBoundary>
  );
}
