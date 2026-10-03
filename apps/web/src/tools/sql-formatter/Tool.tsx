"use client";

import { useState } from "react";
import { Select } from "@/components/ui/field";
import { FormatterTool } from "@/components/tool/FormatterTool";

const DIALECTS = [
  ["sql", "Standard SQL"], ["postgresql", "PostgreSQL"], ["mysql", "MySQL"], ["mariadb", "MariaDB"], ["sqlite", "SQLite"], ["tsql", "SQL Server (T-SQL)"],
  ["plsql", "Oracle PL/SQL"], ["bigquery", "BigQuery"], ["snowflake", "Snowflake"], ["redshift", "Redshift"], ["spark", "Spark SQL"], ["db2", "DB2"],
] as const;

const SAMPLE = "select o.id, c.name, sum(i.qty * i.price) as total from orders o join customers c on c.id = o.customer_id join order_items i on i.order_id = o.id where o.created_at >= '2026-04-01' and c.city in ('Pune','Mumbai') group by o.id, c.name having sum(i.qty * i.price) > 1000 order by total desc limit 20;";

export default function SqlFormatter() {
  const [dialect, setDialect] = useState("postgresql");
  const [keywordCase, setKeywordCase] = useState<"upper" | "lower" | "preserve">("upper");
  const [indent, setIndent] = useState(2);
  return (
    <FormatterTool
      language="SQL"
      sample={SAMPLE}
      fileName="query.sql"
      mime="application/sql"
      accept=".sql,text/plain"
      deps={[dialect, keywordCase, indent]}
      format={async (sql) => {
        const { format } = await import("sql-formatter");
        return format(sql, { language: dialect as never, keywordCase, tabWidth: indent, linesBetweenQueries: 1 });
      }}
      toolbar={
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">Dialect
            <Select value={dialect} onChange={(e) => setDialect(e.target.value)} className="h-10 w-52">
              {DIALECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Keywords
            <Select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as typeof keywordCase)} className="h-10 w-36">
              <option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="preserve">Preserve</option>
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">Indent
            <Select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="h-10 w-28">
              <option value={2}>2 spaces</option><option value={4}>4 spaces</option>
            </Select>
          </label>
        </>
      }
    />
  );
}
