"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { useToast } from "./toast";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts without the async clipboard API.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

interface CopyButtonProps {
  value: string | (() => string);
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

export function CopyButton({ value, label = "Copy", variant = "secondary", size = "sm", className, disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const iconOnly = size === "icon" || size === "icon-sm";

  async function onClick() {
    const text = typeof value === "function" ? value() : value;
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } else {
      toast("Couldn't copy. Your browser blocked clipboard access.", "error");
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      disabled={disabled}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {!iconOnly && <span aria-live="polite">{copied ? "Copied" : label}</span>}
    </Button>
  );
}
