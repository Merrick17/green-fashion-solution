'use client';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
import type { PortalCalendarEvent } from '@/lib/calendar/map-calendar-events';

const TYPE_LABEL: Record<PortalCalendarEvent['type'], string> = {
  meeting: 'Meeting',
  milestone: 'Milestone',
  task: 'Task',
};

const TYPE_CLASS: Record<PortalCalendarEvent['type'], string> = {
  meeting: 'bg-portal-accent-soft text-portal-accent',
  milestone: 'bg-brand-accent/15 text-brand-accent',
  task: 'bg-portal-surface-muted text-muted-foreground',
};

interface CalendarUpcomingListProps {
  events: PortalCalendarEvent[];
  onSelectEvent: (event: PortalCalendarEvent) => void;
}

export function CalendarUpcomingList({
  events,
  onSelectEvent,
}: CalendarUpcomingListProps) {
  const upcoming = [...events]
    .filter((e) => e.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 12);

  return (
    <div className="flex w-full shrink-0 flex-col border border-portal-border bg-portal-surface lg:w-80">
      <div className="border-b border-portal-border px-4 py-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Upcoming</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {upcoming.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No upcoming events this month.
          </p>
        ) : (
          upcoming.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelectEvent(event)}
              className="flex w-full items-start gap-4 border-b border-portal-border px-4 py-3 text-left transition-colors hover:bg-portal-surface-muted"
            >
              <div className="w-10 shrink-0 text-center">
                <p className="font-serif text-2xl leading-none text-foreground">
                  {format(event.start, 'd')}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {format(event.start, 'MMM')}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {event.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(event.start, 'h:mm a')}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] font-medium',
                      TYPE_CLASS[event.type],
                    )}
                  >
                    {TYPE_LABEL[event.type]}
                  </span>
                  {event.status && <StatusBadge status={event.status} />}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}