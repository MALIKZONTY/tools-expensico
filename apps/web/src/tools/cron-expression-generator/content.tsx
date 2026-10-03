import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Start from a preset or type into the five fields.", "Read the plain-English description to check it means what you intended.", "Check the next run times, then copy the expression."],
  sections: [
    {
      heading: "Cron syntax",
      body: (
        <>
          <pre>
            <code>{"┌ minute (0–59)\n│ ┌ hour (0–23)\n│ │ ┌ day of month (1–31)\n│ │ │ ┌ month (1–12)\n│ │ │ │ ┌ day of week (0–6, Sunday = 0 or 7)\n* * * * *"}</code>
          </pre>
          <ul>
            <li><code>*</code> any value · <code>5</code> exact value · <code>1-5</code> range · <code>1,15</code> list · <code>*/10</code> every 10th</li>
            <li>Macros: <code>@hourly</code>, <code>@daily</code>, <code>@weekly</code>, <code>@monthly</code>, <code>@yearly</code></li>
          </ul>
        </>
      ),
    },
    {
      heading: "The day-of-month / day-of-week gotcha",
      body: <p>If you restrict both day fields, standard cron runs when <em>either</em> matches. <code>0 0 13 * 5</code> runs on the 13th of every month <strong>and</strong> every Friday — not only on Friday the 13th. The next-run preview here follows the same rule.</p>,
    },
    {
      heading: "Time zones",
      body: <p>Cron runs in the server&apos;s time zone, which is often UTC. The preview uses your device&apos;s time zone; adjust hours if your server runs in UTC (for example, 9:00 IST is 3:30 UTC).</p>,
    },
  ],
  faqs: [
    { q: "Does this support seconds or the Quartz format?", a: "No. It uses the classic five-field Unix/Vixie cron format used by crontab, GitHub Actions, Kubernetes CronJobs and most cloud schedulers. Quartz and some tools add a seconds field." },
    { q: "Why does GitHub Actions run my job late?", a: "Scheduled workflows run in UTC and can be delayed during busy periods. The expression itself is standard cron." },
  ],
};

export default content;
