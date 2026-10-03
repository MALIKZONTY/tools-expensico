import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ children, className, size = "default", id }: { children: ReactNode; className?: string; size?: "default" | "narrow" | "wide"; id?: string }) {
  return (
    <div
      id={id}
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "default" && "max-w-7xl",
        size === "narrow" && "max-w-3xl",
        size === "wide" && "max-w-[96rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}
