import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AppPage } from "./app-page";
import { PageHeader } from "./page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import type { PaginatedMeta } from "@repo/types";

type ListPageProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  meta?: PaginatedMeta;
  onPageChange?: (page: number) => void;
  className?: string;
  width?: "default" | "wide" | "full" | "narrow";
};

export function ListPage({
  title,
  description,
  actions,
  filters,
  children,
  isEmpty,
  emptyState,
  meta,
  onPageChange,
  className,
  width = "wide",
}: ListPageProps) {
  return (
    <AppPage width={width} className={cn("px-6 py-6", className)}>
      <PageHeader title={title} description={description} actions={actions} />
      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      {isEmpty && emptyState ? emptyState : children}
      {meta && onPageChange && (
        <PaginationControls meta={meta} onPageChange={onPageChange} />
      )}
    </AppPage>
  );
}
