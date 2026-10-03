"use client";

import { useRef } from "react";
import Link from "next/link";
import { Download, Maximize2, NotebookTabs, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { SaveStatus } from "@/components/tool/SaveStatus";
import { useKv } from "@/lib/storage/use-kv";
import { downloadText } from "@/lib/files/download";
import { textStats } from "@/lib/text/stats";
import { notesRepository } from "@/lib/notes/local-repository";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/use-confirm";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export default function Notepad() {
  const [text, setText, status, savedAt] = useKv("notepad", "");
  const [prefs, setPrefs] = useKv("notepad-prefs", { size: "md" as "sm" | "md" | "lg", wrap: true, mono: false });
  const ref = useRef<HTMLTextAreaElement>(null);
  const stats = textStats(text);
  const { toast } = useToast();
  const router = useRouter();
  const [confirm, confirmDialog] = useConfirm();

  async function saveAsNote() {
    if (!text.trim()) return;
    try {
      const note = await notesRepository().create({ content: text });
      toast("Saved to Notes");
      router.push(`/notes?note=${note.id}`);
    } catch {
      toast("Couldn't save to Notes — storage is unavailable in this browser.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented label="Text size" size="sm" value={prefs.size} onChange={(size) => setPrefs({ ...prefs, size })} options={[{ value: "sm", label: "A" }, { value: "md", label: <span className="text-base">A</span> }, { value: "lg", label: <span className="text-lg">A</span> }]} />
        <Segmented label="Font" size="sm" value={prefs.mono ? "mono" : "sans"} onChange={(v) => setPrefs({ ...prefs, mono: v === "mono" })} options={[{ value: "sans", label: "Sans" }, { value: "mono", label: "Mono" }]} />
        <Segmented label="Line wrap" size="sm" value={prefs.wrap ? "wrap" : "nowrap"} onChange={(v) => setPrefs({ ...prefs, wrap: v === "wrap" })} options={[{ value: "wrap", label: "Wrap" }, { value: "nowrap", label: "No wrap" }]} />
        <div className="ml-auto flex flex-wrap gap-1">
          <CopyButton value={text} variant="ghost" disabled={!text} />
          <Button variant="ghost" size="sm" disabled={!text} onClick={() => downloadText(text, "notes.txt")}>
            <Download aria-hidden /> .txt
          </Button>
          <Button variant="ghost" size="sm" disabled={!text.trim()} onClick={saveAsNote}>
            <NotebookTabs aria-hidden /> Save to Notes
          </Button>
          <Button variant="ghost" size="sm" onClick={() => ref.current?.requestFullscreen?.()} aria-label="Full screen">
            <Maximize2 aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!text}
            onClick={async () => {
              if (await confirm({ title: "Clear the notepad?", description: "This can't be undone. Download or save to Notes first if you need the text.", confirmLabel: "Clear", danger: true })) setText("");
            }}
          >
            <Trash2 aria-hidden /> Clear
          </Button>
        </div>
      </div>
      <textarea
        ref={ref}
        aria-label="Notepad"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing… everything is saved automatically in this browser."
        spellCheck
        wrap={prefs.wrap ? "soft" : "off"}
        className={cn(
          "min-h-[55vh] w-full resize-y rounded-lg border border-border bg-bg px-4 py-3 leading-relaxed text-fg placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-ring",
          prefs.mono && "font-mono",
          prefs.size === "sm" ? "text-sm" : prefs.size === "lg" ? "text-lg" : "text-base",
          !prefs.wrap && "overflow-x-auto whitespace-pre",
        )}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SaveStatus status={status} savedAt={savedAt} />
        <p className="text-sm tabular-nums text-muted">
          {stats.words.toLocaleString("en-IN")} words · {stats.characters.toLocaleString("en-IN")} characters · {stats.lines.toLocaleString("en-IN")} lines
        </p>
      </div>
      <p className="text-xs text-muted">
        Need more than one page? Use <Link href="/notes" className="underline hover:text-fg">Notes</Link> to keep many notes with search and pinning.
      </p>
      {confirmDialog}
    </div>
  );
}
