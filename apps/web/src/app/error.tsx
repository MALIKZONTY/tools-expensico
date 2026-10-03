"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    track("tool_error", { code: "page-error", digest: error.digest });
  }, [error]);
  return (
    <Container className="py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-xl text-muted">This page hit an unexpected problem. Your files were not uploaded. Try again — if it keeps happening, please let us know.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/contact?topic=bug" className="inline-flex h-11 items-center rounded-md border border-border-strong px-5 font-medium hover:bg-surface-2">Report the problem</Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-subtle">Reference: {error.digest}</p>}
    </Container>
  );
}
