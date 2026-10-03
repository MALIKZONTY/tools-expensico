"use client";

import { useState } from "react";
import { Plus, Printer, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input, Select } from "@/components/ui/field";
import { SaveStatus } from "@/components/tool/SaveStatus";
import { useConfirm } from "@/components/ui/use-confirm";
import { useKv } from "@/lib/storage/use-kv";
import { cn } from "@/lib/cn";

interface Item {
  id: string;
  text: string;
  checked: boolean;
}
interface List {
  id: string;
  name: string;
  items: Item[];
}

const uid = () => (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const TEMPLATES: Record<string, string[]> = {
  "Travel packing": ["ID / passport", "Tickets & bookings", "Phone charger & power bank", "Medicines", "Toiletries", "Clothes", "Cash & cards", "Reusable water bottle"],
  "Moving house": ["Update address with bank", "Update Aadhaar & PAN address", "Transfer gas connection", "Cancel/transfer broadband", "Book packers & movers", "Meter readings at old home"],
  "Monthly finances": ["Pay credit card bill", "Check SIPs went through", "Pay rent / EMI", "Review subscriptions", "Move savings to deposit"],
  "Job interview": ["Research the company", "Print resume copies", "Prepare questions to ask", "Plan the route / test video call", "Keep ID ready"],
};

export default function Checklist() {
  const [lists, setLists, status, savedAt] = useKv<List[]>("checklists", [{ id: "default", name: "My checklist", items: [] }]);
  const [activeId, setActiveId] = useState("default");
  const [text, setText] = useState("");
  const [confirm, confirmDialog] = useConfirm();
  const active = lists.find((l) => l.id === activeId) ?? lists[0];

  const updateActive = (fn: (l: List) => List) => setLists((prev) => prev.map((l) => (l.id === active?.id ? fn(l) : l)));
  const done = active?.items.filter((i) => i.checked).length ?? 0;
  const total = active?.items.length ?? 0;
  const asText = active ? `${active.name}\n${active.items.map((i) => `${i.checked ? "☑" : "☐"} ${i.text}`).join("\n")}` : "";

  function newList(name: string, items: string[] = []) {
    const l: List = { id: uid(), name, items: items.map((t) => ({ id: uid(), text: t, checked: false })) };
    setLists((prev) => [...prev, l]);
    setActiveId(l.id);
  }

  if (!active) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6 print:border-0 print:shadow-none">
      <div className="flex flex-wrap items-end gap-2 print:hidden">
        <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm font-medium">Checklist
          <Select value={active.id} onChange={(e) => setActiveId(e.target.value)}>
            {lists.map((l) => <option key={l.id} value={l.id}>{l.name || "Untitled"}</option>)}
          </Select>
        </label>
        <Button variant="secondary" onClick={() => newList("New checklist")}><Plus aria-hidden /> New list</Button>
        <Select aria-label="Start from a template" value="" onChange={(e) => e.target.value && newList(e.target.value, TEMPLATES[e.target.value])} className="w-48">
          <option value="">From template…</option>
          {Object.keys(TEMPLATES).map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      <Input aria-label="Checklist name" value={active.name} onChange={(e) => updateActive((l) => ({ ...l, name: e.target.value }))} className="h-12 border-transparent px-0 text-xl font-semibold hover:border-border-strong focus-visible:px-3" />

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-label="Checklist progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
        </div>
        <span className="text-sm tabular-nums text-muted">{done}/{total}</span>
      </div>

      <ul className="flex flex-col gap-1">
        {active.items.map((i) => (
          <li key={i.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
            <input type="checkbox" checked={i.checked} aria-label={`Check “${i.text}”`} onChange={(e) => updateActive((l) => ({ ...l, items: l.items.map((x) => (x.id === i.id ? { ...x, checked: e.target.checked } : x)) }))} className="size-5 shrink-0 cursor-pointer accent-[var(--brand)]" />
            <input aria-label="Item text" value={i.text} onChange={(e) => updateActive((l) => ({ ...l, items: l.items.map((x) => (x.id === i.id ? { ...x, text: e.target.value } : x)) }))} className={cn("min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 outline-none focus-visible:outline-2 focus-visible:outline-ring", i.checked && "text-muted line-through")} />
            <Button variant="ghost" size="icon-sm" className="opacity-60 group-hover:opacity-100 print:hidden" aria-label={`Remove “${i.text}”`} onClick={() => updateActive((l) => ({ ...l, items: l.items.filter((x) => x.id !== i.id) }))}>
              <Trash2 aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2 print:hidden"
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;
          updateActive((l) => ({ ...l, items: [...l.items, { id: uid(), text: t.slice(0, 300), checked: false }] }));
          setText("");
        }}
      >
        <Input aria-label="New item" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add an item…" />
        <Button type="submit" variant="secondary" disabled={!text.trim()}><Plus aria-hidden /> Add</Button>
      </form>

      <div className="flex flex-wrap gap-1 border-t border-border pt-3 print:hidden">
        <Button variant="ghost" size="sm" disabled={!done} onClick={() => updateActive((l) => ({ ...l, items: l.items.map((x) => ({ ...x, checked: false })) }))}><RotateCcw aria-hidden /> Uncheck all</Button>
        <CopyButton value={asText} variant="ghost" label="Copy as text" disabled={!total} />
        <Button variant="ghost" size="sm" onClick={() => window.print()} disabled={!total}><Printer aria-hidden /> Print</Button>
        {lists.length > 1 && (
          <Button variant="ghost" size="sm" className="ml-auto text-danger" onClick={async () => {
            if (await confirm({ title: `Delete “${active.name}”?`, description: "The checklist and its items will be removed from this browser.", confirmLabel: "Delete", danger: true })) {
              setLists((prev) => prev.filter((l) => l.id !== active.id));
              setActiveId(lists.find((l) => l.id !== active.id)!.id);
            }
          }}>
            <Trash2 aria-hidden /> Delete list
          </Button>
        )}
      </div>
      <div className="print:hidden"><SaveStatus status={status} savedAt={savedAt} /></div>
      {confirmDialog}
    </div>
  );
}
