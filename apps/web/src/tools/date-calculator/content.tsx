import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Choose a calculation: days between two dates, add or subtract time, or age.", "Pick the dates.", "Read the result in days, working days, weeks, and years-months-days."],
  sections: [
    {
      heading: "Counting days correctly",
      body: <p>By default the count excludes the start date and includes the end date — the number of nights between two dates. Tick “Include the end date” to count both days, as you would for leave or event durations (1 to 3 March is then 3 days).</p>,
    },
    {
      heading: "Working days",
      body: <p>Working days skip Sundays and, by default, Saturdays. Many Indian offices work alternate or all Saturdays, so untick that option if needed. Public holidays aren&apos;t included because they differ between states, banks and employers — subtract them manually.</p>,
    },
    {
      heading: "Adding months",
      body: <p>Months have different lengths, so adding one month to 31 January lands on the last day of February. This is the same convention used by banks for due dates and by most spreadsheet functions (EDATE).</p>,
    },
  ],
  example: { body: <p>From 1 January 2026 to 31 December 2026 is 364 days (365 including both dates). Someone born on 15 August 1990 is 36 years, 1 month and 18 days old on 3 October 2026.</p> },
  faqs: [
    { q: "Does it handle leap years?", a: "Yes. All calculations use the real calendar, including 29 February." },
    { q: "Why might my age differ by a day elsewhere?", a: "Some calculators count the birth date or use time zones. This one works on calendar dates only, which is how age is usually expressed in documents." },
  ],
};

export default content;
