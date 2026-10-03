import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

const styles: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: { box: "bg-info-soft text-info-soft-fg", icon: <Info aria-hidden /> },
  success: { box: "bg-success-soft text-success-soft-fg", icon: <CheckCircle2 aria-hidden /> },
  warning: { box: "bg-warning-soft text-warning-soft-fg", icon: <AlertTriangle aria-hidden /> },
  danger: { box: "bg-danger-soft text-danger-soft-fg", icon: <XCircle aria-hidden /> },
};

interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Use "alert" for errors that appear in response to an action so screen readers announce them. */
  role?: "alert" | "status";
}

export function Alert({ tone = "info", title, children, actions, className, role }: AlertProps) {
  const s = styles[tone];
  return (
    <div role={role} className={cn("flex gap-3 rounded-lg px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-[18px] [&>svg]:shrink-0", s.box, className)}>
      {s.icon}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn("leading-relaxed", title && "mt-0.5")}>{children}</div>}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
