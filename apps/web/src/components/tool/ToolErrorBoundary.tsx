"use client";

import { Component, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

interface State {
  hasError: boolean;
}

/** Keeps a crashing tool from taking down the page; offers a reload instead of a stack trace. */
export class ToolErrorBoundary extends Component<{ children: ReactNode; slug: string }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    track("tool_error", { tool: this.props.slug, code: "crash", name: error.name });
    if (process.env.NODE_ENV !== "production") console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          tone="danger"
          title="This tool ran into a problem"
          role="alert"
          actions={
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Reload the page
            </Button>
          }
        >
          Something unexpected happened while the tool was running. Your files were not uploaded. Reloading usually fixes it; if it doesn&apos;t, please report it using the feedback link below.
        </Alert>
      );
    }
    return this.props.children;
  }
}
