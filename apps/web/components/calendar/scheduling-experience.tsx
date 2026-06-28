'use client';
import { useMemo, useState } from 'react';
import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { RouteError } from '@/components/shared/route-error';
import { useCalendar } from '@/hooks/use-calendar';
import { getCalendarFetchRange } from '@/lib/calendar/calendar-range';
import {
  mapCalendarEvents,
  type PortalCalendarEvent,
} from '@/lib/calendar/map-calendar-events';
import { CalendarMonthGrid } from './calendar-month-grid';
import { CalendarUpcomingList } from './calendar-upcoming-list';

interface SchedulingExperienceProps {
  showMilestones?: boolean;
  showTasks?: boolean;
  adminActions?: boolean;
  onApproveMeeting?: (id: string) => void;
  isApproving?: boolean;
}

export function SchedulingExperience({
  showMilestones = false,
  showTasks = false,
  adminActions = false,
  onApproveMeeting,
  isApproving,
}: SchedulingExperienceProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<PortalCalendarEvent | null>(null);
  const range = useMemo(() => getCalendarFetchRange(month, 'month'), [month]);
  const { data, isLoading, isError, refetch } = useCalendar(range.start, range.end);
  const events = useMemo(
    () =>
      mapCalendarEvents(data, { milestones: showMilestones, tasks: showTasks }),
    [data, showMilestones, showTasks],
  );

  if (isLoading) return <RouteSkeleton variant="calendar" />;
  if (isError) return <RouteError reset={() => void refetch()} />;

  const goToday = () => setMonth(startOfMonth(new Date()));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setMonth(subMonths(month, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="font-serif text-xl text-foreground">
            {format(month, 'MMMM yyyy')}
          </p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>
          Today
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <CalendarMonthGrid
          month={month}
          events={events}
          onSelectEvent={setSelected}
        />
        <CalendarUpcomingList events={events} onSelectEvent={setSelected} />
      </div>
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected?.title}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {format(selected.start, 'EEEE, MMMM d · h:mm a')}
              </p>
              {selected.teamsLink && (
                <Button asChild variant="brand" className="w-full">
                  <a href={selected.teamsLink} target="_blank" rel="noreferrer">
                    Join Teams meeting
                  </a>
                </Button>
              )}
              {adminActions &&
                selected.type === 'meeting' &&
                selected.status === 'REQUESTED' &&
                onApproveMeeting && (
                  <Button
                    className="w-full"
                    disabled={isApproving}
                    onClick={() => {
                      const id = selected.id.replace('meeting-', '');
                      onApproveMeeting(id);
                      setSelected(null);
                    }}
                  >
                    Approve meeting
                  </Button>
                )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}