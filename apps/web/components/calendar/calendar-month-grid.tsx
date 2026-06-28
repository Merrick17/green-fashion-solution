'use client';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { PortalCalendarEvent } from '@/lib/calendar/map-calendar-events';

const MAX_CHIPS = 3;

function chipClass(type: PortalCalendarEvent['type']): string {
  switch (type) {
    case 'meeting':
      return 'bg-portal-accent-soft text-portal-accent';
    case 'milestone':
      return 'bg-brand-accent/15 text-brand-accent';
    default:
      return 'bg-portal-surface-muted text-muted-foreground';
  }
}

export function CalendarEventChip({
  event,
  className,
}: {
  event: PortalCalendarEvent;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'block truncate px-1.5 py-0.5 text-[10px] font-medium leading-tight',
        chipClass(event.type),
        className,
      )}
      title={event.title}
    >
      {event.title}
    </span>
  );
}

interface CalendarMonthGridProps {
  month: Date;
  events: PortalCalendarEvent[];
  onSelectEvent: (event: PortalCalendarEvent) => void;
}

export function CalendarMonthGrid({
  month,
  events,
  onSelectEvent,
}: CalendarMonthGridProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });
  const today = new Date();

  return (
    <div className="flex min-h-0 flex-1 flex-col border border-portal-border bg-portal-surface">
      <div className="grid grid-cols-7 border-b border-portal-border bg-portal-surface-muted text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            className="py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const overflow = Math.max(0, dayEvents.length - MAX_CHIPS);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex min-h-0 flex-col gap-1 border-b border-r border-portal-border p-1.5',
                !inMonth && 'bg-portal-surface-muted/40',
                isToday && 'bg-portal-accent-soft/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center text-[11px]',
                    inMonth ? 'text-foreground' : 'text-muted-foreground/40',
                    isToday &&
                      'bg-portal-accent font-semibold text-portal-accent-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-1">
                {dayEvents.slice(0, MAX_CHIPS).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="text-left"
                  >
                    <CalendarEventChip event={event} />
                  </button>
                ))}
                {overflow > 0 && (
                  <button
                    type="button"
                    onClick={() => dayEvents[0] && onSelectEvent(dayEvents[0])}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}