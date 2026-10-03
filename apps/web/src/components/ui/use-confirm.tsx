"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";

interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}

/** Promise-based confirmation using the accessible Dialog. Render `dialog` once in the component. */
export function useConfirm(): [(o: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  const dialog = (
    <Dialog
      open={opts !== null}
      onClose={() => close(false)}
      size="sm"
      title={opts?.title ?? ""}
      description={opts?.description}
      footer={
        <>
          <Button variant="secondary" onClick={() => close(false)}>Cancel</Button>
          <Button variant={opts?.danger ? "danger" : "primary"} onClick={() => close(true)} autoFocus>
            {opts?.confirmLabel ?? "Confirm"}
          </Button>
        </>
      }
    />
  );
  return [confirm, dialog];
}
