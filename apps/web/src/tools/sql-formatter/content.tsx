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
      heading: "Supported dialects and options",
      body: (
        <>
          <p>
            Choose from Standard SQL, PostgreSQL, MySQL, MariaDB, SQLite, SQL Server (T-SQL), Oracle PL/SQL, BigQuery, Snowflake, Redshift, Spark SQL and DB2. Keywords can be UPPERCASE, lowercase
            or left as written (Preserve), and indentation can be 2 or 4 spaces. When a file contains several statements separated by semicolons, each is formatted and separated by a blank line.
          </p>
          <p>Team style guides differ mostly on keyword case and indent width, so match whatever your existing migrations or code reviews use — consistency matters more than the choice itself.</p>
        </>
      ),
    },
    {
      heading: "What the formatter doesn't do",
      body: <p>It changes only whitespace and keyword case. It doesn&apos;t validate that tables exist, optimise the query, or run it. Formatting happens in your browser with the open-source sql-formatter library, so queries containing real data stay private.</p>,
    },
  ],
  example: {
    heading: "Example",
    body: (
      <>
        <p>A one-line query copied from a log:</p>
        <pre><code>{`select o.id, c.name from orders o join customers c on c.id = o.customer_id where c.city in ('Pune','Mumbai') order by o.id;`}</code></pre>
        <p>Formatted for PostgreSQL with uppercase keywords:</p>
        <pre><code>{`SELECT
  o.id,
  c.name
FROM
  orders o
  JOIN customers c ON c.id = o.customer_id
WHERE
  c.city IN ('Pune', 'Mumbai')
ORDER BY
  o.id;`}</code></pre>
      </>
    ),
  },
  faqs: [
    { q: "Is my SQL sent anywhere?", a: "No. Formatting runs in your browser, so queries with real customer data or credentials never leave your device." },
    { q: "Which dialect should I choose if I'm not sure?", a: "Pick your database if it's listed. Standard SQL works for simple queries; choose the specific dialect when the query uses vendor syntax such as backticks, square brackets or :: casts." },
    { q: "My query contains template placeholders and fails to format.", a: "Placeholders like {{ variable }} aren't valid SQL. Replace them with a literal or a parameter (?, $1, :name) before formatting." },
    { q: "Does it support stored procedures?", a: "Common procedural blocks for PL/SQL and T-SQL are supported, but very complex procedural code may not format perfectly." },
  ],
};

export default content;
