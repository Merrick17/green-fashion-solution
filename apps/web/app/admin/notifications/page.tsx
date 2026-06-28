'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ReadState } from '@/components/shared/tag';
import { Button } from '@/components/ui/button';
import {
  useAdminNotifications,
  useDeleteAdminNotification,
} from '@/hooks/use-admin';
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { AdminEntityRow } from '@/components/admin/admin-entity-row';
import { queryKeys } from '@/lib/query-keys';
export default function AdminNotificationsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading, isError, refetch } = useAdminNotifications(params);
  const deleteNotification = useDeleteAdminNotification();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const qc = useQueryClient();
  const notifications = data?.data ?? [];
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const hasUnread = notifications.some((n) => !n.read);
  const invalidateAdminNotifications = () =>
    qc.invalidateQueries({
      queryKey: queryKeys.admin.notifications(),
    });

  return (
    <AppPage width="full">
      <PageHeader
        title="Notifications"
        description="All in-app notifications"
        actions={
          <Button
            size="sm"
            variant="outline"
            disabled={!hasUnread || markAllRead.isPending}
            onClick={() =>
              markAllRead.mutate(undefined, {
                onSuccess: invalidateAdminNotifications,
              })
            }
          >
            Mark all as read
          </Button>
        }
      />
      <EntityList
        items={notifications}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        loadingVariant="rows"
        emptyTitle="No notifications"
        emptyDescription="In-app notifications will appear here."
        renderItem={(n) => (
          <AdminEntityRow
            key={n.id}
            title={n.message}
            subtitle={`${n.user.name} · ${n.type.replace(/_/g, ' ')}`}
            createdAt={n.createdAt}
            actions={
              <div className="flex items-center gap-2">
                {!n.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={markRead.isPending}
                    onClick={() =>
                      markRead.mutate(n.id, {
                        onSuccess: invalidateAdminNotifications,
                      })
                    }
                  >
                    Mark as read
                  </Button>
                )}
                <ReadState read={n.read} />
              </div>
            }
            onDelete={() => setDeleteTargetId(n.id)}
          />
        )}
      />
      {!isLoading && notifications.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete notification"
        description="Delete this notification permanently? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTargetId) return;
          const id = deleteTargetId;
          setDeleteTargetId(null);
          deleteNotification.mutate(id);
        }}
      />
    </AppPage>
  );
}
