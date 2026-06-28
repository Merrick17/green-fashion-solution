import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AppPageWidth = "default" | "wide" | "full" | "narrow";

type AppPageProps = {
  children: ReactNode;
  width?: AppPageWidth;
  className?: string;
  variant?: "default" | "dashboard";
};

const widthClass: Record<AppPageWidth, string> = {
  default: "max-w-[var(--content-editorial)]",
  wide: "max-w-[var(--content-wide)]",
  full: "max-w-none",
  narrow: "max-w-[var(--content-narrow)]",
};

export function AppPage({
  children,
  width = "default",
  className,
  variant = "default",
}: AppPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col",
        variant === "dashboard"
          ? "mx-auto max-w-[var(--content-wide)] gap-10 pb-8"
          : "gap-8",
        width !== "full" && widthClass[width],
        width !== "full" && "mx-auto w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}
