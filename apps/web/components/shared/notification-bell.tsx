'use client';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';
import { notificationHref as resolveNotificationHref } from '@/lib/notification-href';
interface NotificationBellProps {
  notificationsPageHref?: string;
}
export function NotificationBell({
  notificationsPageHref = '/customer/notifications',
}: NotificationBellProps) {
  const { data: notificationsData } = useNotifications({ page: 1, limit: 20 });
  const notifications = notificationsData?.data ?? [];
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
          }
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
              {unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-80 overflow-auto">
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
        ) : (
          notifications.slice(0, 10).map((n) => {
            const href = resolveNotificationHref(n);
            return (
              <DropdownMenuItem
                key={n.id}
                asChild
                className={n.read ? 'opacity-60' : ''}
              >
                <Link
                  href={href}
                  onClick={() => !n.read && markRead.mutate(n.id)}
                  className="flex cursor-pointer flex-col gap-0.5"
                >
                  <span className="text-xs font-medium">
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {n.message}
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
        {unread > 0 && (
          <DropdownMenuItem onClick={() => markAllRead.mutate()}>
            Mark all as read
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={notificationsPageHref}>View all notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
