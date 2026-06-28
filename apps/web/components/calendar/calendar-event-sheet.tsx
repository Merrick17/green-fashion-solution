'use client';
import type { PortalCalendarEvent } from '@/lib/calendar/map-calendar-events';
import { formatDateTime } from '@repo/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MeetingStatus } from '@repo/types';
import { Calendar, ExternalLink, Flag, ListTodo, type LucideIcon } from 'lucide-react';
interface CalendarEventSheetProps {
  event: PortalCalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminActions?: boolean;
  onApproveMeeting?: (id: string) => void;
  isApproving?: boolean;
}
const TYPE_LABELS = {
  meeting: 'Meeting',
  milestone: 'Milestone',
  task: 'Sourcing task',
};

const TYPE_ICONS: Record<PortalCalendarEvent['type'], LucideIcon> = {
  meeting: Calendar,
  milestone: Flag,
  task: ListTodo,
};
export function CalendarEventSheet({
  event,
  open,
  onOpenChange,
  adminActions,
  onApproveMeeting,
  isApproving,
}: CalendarEventSheetProps) {
  if (!event) return null;
  const rawId = event.id.replace(/^(meeting|milestone|task)-/, '');
  const Icon = TYPE_ICONS[event.type];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2 text-primary">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {TYPE_LABELS[event.type]}
            </span>
          </div>
          <SheetTitle className="font-serif text-2xl">{event.title}</SheetTitle>
          <SheetDescription>
            {formatDateTime(event.start.toISOString())}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {event.status && <StatusBadge status={event.status} />}
          {event.projectId && (
            <p className="text-sm text-muted-foreground">
              Project
              <span className="font-mono text-foreground">
                {event.projectId.slice(0, 12)}
              </span>
            </p>
          )}
          {event.type === 'meeting' && event.teamsLink && (
            <Button asChild variant="outline" className="w-full">
              <a href={event.teamsLink} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Join Microsoft Teams
              </a>
            </Button>
          )}
          {adminActions &&
            event.type === 'meeting' &&
            event.status === MeetingStatus.REQUESTED &&
            onApproveMeeting && (
              <Button
                className="w-full"
                disabled={isApproving}
                onClick={() => onApproveMeeting(rawId)}
              >
                Schedule meeting
              </Button>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
