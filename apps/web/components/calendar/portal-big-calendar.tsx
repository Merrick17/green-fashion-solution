'use client';
import { useCallback, useMemo, useState } from 'react';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  dateFnsLocalizer,
  Views,
  type View,
  type EventPropGetter,
} from 'react-big-calendar';
import { ShadcnBigCalendar } from '@/components/calendar/big-calendar';
import { GoogleCalendarToolbar } from '@/components/calendar/google-calendar-toolbar';
import { CalendarEventSheet } from '@/components/calendar/calendar-event-sheet';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { useCalendar } from '@/hooks/use-calendar';
import { getCalendarFetchRange } from '@/lib/calendar/calendar-range';
import { formatCalendarToolbarLabel } from '@/lib/calendar/calendar-label';
import {
  eventStyleClass,
  mapCalendarEvents,
  type PortalCalendarEvent,
} from '@/lib/calendar/map-calendar-events';
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
});
const CALENDAR_VIEWS: View[] = [
  Views.MONTH,
  Views.WEEK,
  Views.DAY,
  Views.AGENDA,
];
interface PortalBigCalendarProps {
  showMilestones?: boolean;
  showTasks?: boolean;
  adminActions?: boolean;
  onApproveMeeting?: (id: string) => void;
  isApproving?: boolean;
  height?: string;
}
export function PortalBigCalendar({
  showMilestones = false,
  showTasks = false,
  adminActions = false,
  onApproveMeeting,
  isApproving,
  height = 'calc(100dvh - var(--h-14) - 6.5rem)',
}: PortalBigCalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(() => new Date());
  const [selected, setSelected] = useState<PortalCalendarEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const range = useMemo(() => getCalendarFetchRange(date, view), [date, view]);
  const { data, isLoading } = useCalendar(range.start, range.end);
  const events = useMemo(
    () =>
      mapCalendarEvents(data, { milestones: showMilestones, tasks: showTasks }),
    [data, showMilestones, showTasks],
  );
  const eventPropGetter: EventPropGetter<PortalCalendarEvent> = useCallback(
    (event) => ({ className: eventStyleClass(event) }),
    [],
  );
  const navigate = useCallback(
    (action: 'TODAY' | 'PREV' | 'NEXT') => {
      const d = new Date(date);
      if (action === 'TODAY') {
        setDate(new Date());
        return;
      }
      const delta = action === 'PREV' ? -1 : 1;
      switch (view) {
        case Views.MONTH:
          d.setMonth(d.getMonth() + delta);
          break;
        case Views.WEEK:
          d.setDate(d.getDate() + delta * 7);
          break;
        default:
          d.setDate(d.getDate() + delta);
          break;
      }
      setDate(d);
    },
    [date, view],
  );
  if (isLoading && events.length === 0) {
    return <RouteSkeleton variant="list" />;
  }
  return (
    <>
      <div
        className="gcal-shell flex min-h-0 flex-col overflow-hidden border border-portal-border bg-portal-surface"
        style={{ height }}
      >
        <GoogleCalendarToolbar
          label={formatCalendarToolbarLabel(date, view)}
          view={view}
          views={CALENDAR_VIEWS}
          onToday={() => navigate('TODAY')}
          onPrev={() => navigate('PREV')}
          onNext={() => navigate('NEXT')}
          onViewChange={setView}
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ShadcnBigCalendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            views={CALENDAR_VIEWS}
            startAccessor="start"
            endAccessor="end"
            allDayAccessor="allDay"
            popup
            selectable={false}
            toolbar={false}
            eventPropGetter={eventPropGetter}
            onSelectEvent={(event) => {
              setSelected(event);
              setSheetOpen(true);
            }}
            style={{ height: '100%', minHeight: 520 }}
            messages={{
              noEventsInRange: 'No events in this range.',
              showMore: (total) => `+${total} more`,
            }}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-chart-1" /> Meetings
        </span>
        {showMilestones && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-chart-2" /> Milestones
          </span>
        )}
        {showTasks && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-chart-3" /> Tasks
          </span>
        )}
      </div>
      <CalendarEventSheet
        event={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        adminActions={adminActions}
        onApproveMeeting={onApproveMeeting}
        isApproving={isApproving}
      />
    </>
  );
}
