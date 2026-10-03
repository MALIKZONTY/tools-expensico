"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/progress";

const NotesApp = dynamic(() => import("./NotesApp").then((m) => m.NotesApp), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl border border-border bg-surface">
      <Spinner label="Loading notes" />
    </div>
  ),
});

export function NotesMount() {
  return <NotesApp />;
}
