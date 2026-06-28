'use client';

import { DayView, MonthView, WeekView } from './calendar-grid-cells';

export interface CalendarGridEventItem {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'milestone' | 'task';
  status?: string;
}

export type CalendarGridViewMode = 'day' | 'week' | 'month';

export interface CalendarGridViewProps {
  view: CalendarGridViewMode;
  events: CalendarGridEventItem[];
  rangeStart: string;
  /** When true, day cards show type-based status badges (admin calendar). */
  typeBasedStatus?: boolean;
}

export function CalendarGridView({
  view,
  events,
  rangeStart,
  typeBasedStatus,
}: CalendarGridViewProps) {
  const anchor = new Date(rangeStart);

  switch (view) {
    case 'day':
      return (
        <DayView
          anchor={anchor}
          events={events}
          typeBasedStatus={typeBasedStatus}
        />
      );
    case 'week':
      return <WeekView anchor={anchor} events={events} />;
    default:
      return <MonthView anchor={anchor} events={events} />;
  }
}
