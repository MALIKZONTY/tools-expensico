export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  category: "finance" | "files" | "pdf" | "developer" | "productivity";
  published: string;
  updated?: string;
  readingMinutes: number;
  /** Tools this guide explains or links to. */
  tools: string[];
}

export const GUIDES: GuideMeta[] = [
  {
    slug: "how-emi-is-calculated",
    title: "How EMI Is Calculated: Formula, Examples and What Changes Your EMI",
    description: "Understand the EMI formula step by step, see a worked home-loan example, and learn how rate, tenure and prepayments change what you pay.",
    category: "finance",
    published: "2026-10-03",
    readingMinutes: 7,
    tools: ["emi-calculator", "loan-calculator", "debt-payoff-calculator"],
  },
  {
    slug: "ctc-vs-in-hand-salary",
    title: "CTC vs In-hand Salary: Where the Difference Goes",
    description: "Why your take-home pay is lower than your CTC: EPF, gratuity, professional tax, income tax and other components explained with an example.",
    category: "finance",
    published: "2026-10-03",
    readingMinutes: 8,
    tools: ["salary-calculator", "pf-calculator"],
  },
  {
    slug: "sip-returns-explained",
    title: "SIP Returns Explained: How Monthly Investing Grows",
    description: "How SIP future value is calculated, why returns are not guaranteed, what step-up SIPs do, and how to read XIRR versus CAGR.",
    category: "finance",
    published: "2026-10-03",
    readingMinutes: 7,
    tools: ["sip-calculator", "compound-interest-calculator", "inflation-calculator"],
  },
  {
    slug: "jpg-vs-png-vs-webp",
    title: "JPG vs PNG vs WebP vs AVIF: Which Image Format Should You Use?",
    description: "A practical comparison of image formats — compression, transparency, quality and compatibility — with clear recommendations for common tasks.",
    category: "files",
    published: "2026-10-03",
    readingMinutes: 6,
    tools: ["image-compressor", "png-to-jpg", "jpg-to-webp", "png-to-webp"],
  },
  {
    slug: "reduce-pdf-file-size",
    title: "How to Reduce PDF File Size (and Why PDFs Get So Big)",
    description: "What makes PDFs large, which compression methods keep text sharp, and how to get under email and portal upload limits.",
    category: "pdf",
    published: "2026-10-03",
    readingMinutes: 6,
    tools: ["pdf-compress", "pdf-split", "image-compressor"],
  },
  {
    slug: "csv-vs-excel",
    title: "CSV vs Excel: Differences, Pitfalls and When to Use Each",
    description: "How CSV and XLSX differ, why Excel drops leading zeros and mangles long numbers, and how to move data between the two safely.",
    category: "files",
    published: "2026-10-03",
    readingMinutes: 6,
    tools: ["csv-viewer", "csv-to-xlsx", "xlsx-to-csv"],
  },
  {
    slug: "what-is-a-jwt",
    title: "What Is a JWT? Structure, Claims and Common Mistakes",
    description: "How JSON Web Tokens are built, what the header, payload and signature do, and the security mistakes to avoid when using them.",
    category: "developer",
    published: "2026-10-03",
    readingMinutes: 7,
    tools: ["jwt-decoder", "base64-encoder-decoder", "timestamp-converter"],
  },
  {
    slug: "browser-file-processing",
    title: "How In-Browser File Processing Works (and Why It's More Private)",
    description: "What it means when a tool “runs in your browser”, how that keeps files private, and when a server is genuinely needed.",
    category: "files",
    published: "2026-10-03",
    readingMinutes: 5,
    tools: ["pdf-to-jpg", "image-compressor", "file-info"],
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
