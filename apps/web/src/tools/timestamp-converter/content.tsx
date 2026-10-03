import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste a Unix timestamp — seconds, milliseconds or microseconds are detected automatically.", "Pick a time zone to see the date there, in UTC and as ISO 8601.", "To go the other way, choose a date and time on the right."],
  sections: [
    {
      heading: "What is a Unix timestamp?",
      body: <p>Unix time counts the seconds since 00:00:00 UTC on 1 January 1970 (the “epoch”), ignoring leap seconds. It&apos;s time-zone independent, which is why servers, databases and logs use it. JavaScript and many APIs use milliseconds instead of seconds; some systems use microseconds.</p>,
    },
    {
      heading: "How the unit is detected",
      body: (
        <ul>
          <li>Up to 11 digits: seconds (covers dates until the year 5138).</li>
          <li>12–14 digits: milliseconds.</li>
          <li>15 or more digits: microseconds.</li>
        </ul>
      ),
    },
    {
      heading: "The year 2038 problem",
      body: <p>Systems that store Unix time as a signed 32-bit integer overflow at 2,147,483,647 seconds — 03:14:07 UTC on 19 January 2038. Modern systems use 64-bit values and aren&apos;t affected.</p>,
    },
  ],
  example: { body: <p><code>1700000000</code> is 14 November 2023, 22:13:20 UTC — 15 November 2023, 03:43:20 in India (IST, UTC+5:30).</p> },
  faqs: [
    { q: "Why is my converted time off by 5½ hours?", a: "Timestamps are in UTC. India Standard Time is UTC+5:30, so make sure you're reading the value for the Asia/Kolkata time zone." },
    { q: "Does it handle negative timestamps?", a: "Yes. Negative values are dates before 1970." },
  ],
};

export default content;
