import type { ToolContent } from "@/registry/content-types";

const content: ToolContent = {
  steps: ["Paste a query or open a .sql file.", "Choose your database dialect, keyword case and indentation.", "Copy or download the formatted SQL."],
  sections: [
    {
      heading: "Why format SQL?",
      body: <p>Queries copied from ORMs, logs and monitoring tools arrive on one line. Consistent formatting — one clause per line, indented joins and conditions, uppercase keywords — makes them far easier to review, debug and diff.</p>,
    },
    {
      heading: "Dialect matters",
      body: <p>Each database has its own syntax: PostgreSQL&apos;s <code>::</code> casts and <code>$1</code> parameters, MySQL&apos;s backtick identifiers, T-SQL&apos;s square brackets, BigQuery&apos;s backtick table paths. Choosing the right dialect lets the formatter recognise them instead of breaking them apart.</p>,
    },
    {
      heading: "What the formatter doesn't do",
      body: <p>It changes only whitespace and keyword case. It doesn&apos;t validate that tables exist, optimise the query, or run it. Formatting happens in your browser with the open-source sql-formatter library, so queries containing real data stay private.</p>,
    },
  ],
  faqs: [
    { q: "My query contains template placeholders and fails to format.", a: "Placeholders like {{ variable }} aren't valid SQL. Replace them with a literal or a parameter (?, $1, :name) before formatting." },
    { q: "Does it support stored procedures?", a: "Common procedural blocks for PL/SQL and T-SQL are supported, but very complex procedural code may not format perfectly." },
  ],
};

export default content;
