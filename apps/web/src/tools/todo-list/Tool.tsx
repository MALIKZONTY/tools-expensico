"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import { SaveStatus } from "@/components/tool/SaveStatus";
import { useKv } from "@/lib/storage/use-kv";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/cn";

type Priority = "high" | "normal" | "low";
interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  due: string;
  createdAt: number;
}

const uid = () => (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

export default function TodoList() {
  const [todos, setTodos, status, savedAt] = useKv<Todo[]>("todos", []);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("active");
  const mounted = useMounted();
  const today = mounted ? new Date().toISOString().slice(0, 10) : "";

  const visible = useMemo(
    () =>
      todos
        .filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done))
        .sort((a, b) => Number(a.done) - Number(b.done) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.due || "9999").localeCompare(b.due || "9999") || a.createdAt - b.createdAt),
    [todos, filter],
  );
  const remaining = todos.filter((t) => !t.done).length;

  function add() {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [...prev, { id: uid(), text: t.slice(0, 500), done: false, priority, due, createdAt: Date.now() }]);
    setText("");
    setDue("");
  }

  const update = (id: string, patch: Partial<Todo>) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <form
        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_10rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <Input aria-label="New task" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a task…" maxLength={500} />
        <Select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option>
        </Select>
        <Input aria-label="Due date (optional)" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <Button type="submit" disabled={!text.trim()}><Plus aria-hidden /> Add</Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented label="Show" size="sm" value={filter} onChange={setFilter} options={[{ value: "active", label: `To do (${remaining})` }, { value: "done", label: "Done" }, { value: "all", label: "All" }]} />
        {todos.some((t) => t.done) && (
          <Button variant="ghost" size="sm" onClick={() => setTodos((prev) => prev.filter((t) => !t.done))}>Clear completed</Button>
        )}
      </div>

      {status === "loading" ? (
        <p className="py-8 text-center text-sm text-muted">Loading your tasks…</p>
      ) : visible.length === 0 ? (
        <EmptyState title={filter === "done" ? "Nothing completed yet" : todos.length ? "All done! 🎉" : "No tasks yet"} description={todos.length ? undefined : "Add your first task above. Tasks are saved in this browser."} />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {visible.map((t) => {
            const overdue = !t.done && t.due && today && t.due < today;
            return (
              <li key={t.id} className="flex items-center gap-3 px-3 py-2.5">
                <input type="checkbox" checked={t.done} onChange={(e) => update(t.id, { done: e.target.checked })} aria-label={`Mark “${t.text}” as ${t.done ? "not done" : "done"}`} className="size-5 shrink-0 cursor-pointer accent-[var(--brand)]" />
                <div className="min-w-0 flex-1">
                  <input
                    aria-label="Task text"
                    value={t.text}
                    onChange={(e) => update(t.id, { text: e.target.value })}
                    className={cn("w-full rounded bg-transparent px-1 py-0.5 text-[0.9375rem] outline-none focus-visible:outline-2 focus-visible:outline-ring", t.done && "text-muted line-through")}
                  />
                  <div className="flex flex-wrap gap-2 px-1 text-xs">
                    {t.priority !== "normal" && <span className={t.priority === "high" ? "font-medium text-danger" : "text-muted"}>{t.priority === "high" ? "High priority" : "Low priority"}</span>}
                    {t.due && (
                      <span className={cn("inline-flex items-center gap-1", overdue ? "font-medium text-danger" : "text-muted")}>
                        <CalendarDays aria-hidden className="size-3.5" />
                        {overdue ? "Overdue · " : "Due "}
                        {new Date(t.due + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label={`Delete “${t.text}”`} onClick={() => setTodos((prev) => prev.filter((x) => x.id !== t.id))}>
                  <Trash2 aria-hidden />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <SaveStatus status={status} savedAt={savedAt} />
    </div>
  );
}
