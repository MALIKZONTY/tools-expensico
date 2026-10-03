import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Enter a size and choose its unit.", "Read the equivalent in every other unit, in both decimal and binary systems.", "Optionally estimate download time at your connection speed."],
  sections: [
    {
      heading: "Why does my 1 TB drive show 931 GB?",
      body: <p>Storage manufacturers use decimal units: 1 TB = 1,000,000,000,000 bytes. Windows reports sizes in binary units (1 GB as it&apos;s shown = 1,073,741,824 bytes) while still labelling them “GB”. 10¹² ÷ 1024³ ≈ 931, so nothing is missing — it&apos;s the same number of bytes counted two ways. macOS and most phones use decimal units, so they show 1 TB.</p>,
    },
    {
      heading: "KB vs KiB",
      body: <p>The IEC standard defines KiB, MiB and GiB for powers of 1024 and keeps KB, MB and GB for powers of 1000. In everyday use “MB” is used for both, so check which a system means when precision matters.</p>,
    },
    {
      heading: "Bits vs bytes",
      body: <p>Internet speeds are quoted in megabits per second (Mbps); file sizes in megabytes. One byte is eight bits, so a 100 Mbps connection downloads at most 12.5 MB per second.</p>,
    },
  ],
  faqs: [{ q: "How many MB is 1 GB?", a: "1,000 MB in decimal units (used by storage makers and macOS), or 1,024 MiB in binary units (used by Windows)." }],
};

export default content;
