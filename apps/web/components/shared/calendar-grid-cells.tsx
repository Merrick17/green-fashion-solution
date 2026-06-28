'use client';

import { formatDate, formatDateTime } from '@repo/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
import type { CalendarGridEventItem } from './calendar-grid-view';

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function startOfWeek(d: Date) {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
}

function CalendarEventCard({
  event,
  showTime,
  typeBasedStatus,
}: {
  event: CalendarGridEventItem;
  showTime?: boolean;
  typeBasedStatus?: boolean;
}) {
  return (
    <div className="border border-border bg-card flex items-center justify-between p-3 text-sm">
      <div className="flex items-center gap-2">
        <span>{event.title}</span>
        {typeBasedStatus ? (
          <StatusBadge
            status={event.type === 'meeting' ? 'SCHEDULED' : 'IN_PROGRESS'}
          />
        ) : (
          event.status && <StatusBadge status={event.status} />
        )}
      </div>
      <span className="text-muted-foreground">
        {showTime ? formatDateTime(event.date) : formatDate(event.date)}
      </span>
    </div>
  );
}

export function DayView({
  anchor,
  events,
  typeBasedStatus,
}: {
  anchor: Date;
  events: CalendarGridEventItem[];
  typeBasedStatus?: boolean;
}) {
  const dayEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.toDateString() === anchor.toDateString();
  });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{formatDate(anchor.toISOString())}</p>
      {dayEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events today.</p>
      ) : (
        dayEvents.map((e) => (
          <CalendarEventCard
            key={e.id}
            event={e}
            showTime
            typeBasedStatus={typeBasedStatus}
          />
        ))
      )}
    </div>
  );
}

export function WeekView({
  anchor,
  events,
}: {
  anchor: Date;
  events: CalendarGridEventItem[];
}) {
  const weekStart = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => {
        const dayEvents = events.filter(
          (e) => new Date(e.date).toDateString() === d.toDateString(),
        );
        return (
          <div key={d.toISOString()} className="border border-border bg-card min-h-24 p-2">
            <p className="mb-1 text-[10px] font-medium text-muted-foreground">
              {d.toLocaleDateString(undefined, {
                weekday: 'short',
                day: 'numeric',
              })}
            </p>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((e) => (
                <p key={e.id} className="truncate text-[10px]">
                  {e.title}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MonthView({
  anchor,
  events,
}: {
  anchor: Date;
  events: CalendarGridEventItem[];
}) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    return i - firstDay + 1;
  });

  return (
    <div>
      <p className="mb-3 text-sm font-medium">
        {anchor.toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric',
        })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const date = new Date(year, month, day);
          const dayEvents = events.filter(
            (e) => new Date(e.date).toDateString() === date.toDateString(),
          );
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div
              key={day}
              className={cn(
                'border border-border bg-card min-h-16 p-1 text-left',
                isToday && 'ring-1 ring-primary',
              )}
            >
              <p className="text-[10px] font-medium">{day}</p>
              {dayEvents.slice(0, 2).map((e) => (
                <p
                  key={e.id}
                  className="truncate text-[9px] text-muted-foreground"
                >
                  {e.title}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
