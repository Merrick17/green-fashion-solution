'use client';
import Link from 'next/link';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@repo/utils';
import {
  notificationHref,
  notificationTypeLabel,
} from '@/lib/notification-href';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
export default function CustomerNotificationsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading, isError, refetch } = useNotifications(params);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <AppPage>
      <PageHeader
        title="Notifications"
        description="Updates on proposals, meetings, and project status"
        actions={
          unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />
      <EntityList
        items={notifications}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        loadingVariant="rows"
        emptyTitle="No notifications"
        emptyDescription="Updates from your sourcing team will appear here."
        className="gap-2"
        renderItem={(n) => {
          const href = notificationHref(n);
          return (
            <Link
              key={n.id}
              href={href}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={cn(
                'group flex items-start gap-4 border p-5 transition-all',
                n.read
                  ? 'border border-portal-border bg-portal-surface opacity-75'
                  : 'border-primary/20 bg-primary/5',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {notificationTypeLabel(n.type)}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {n.message}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(n.createdAt)}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          );
        }}
      />
      {!isLoading && notifications.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
