'use client';

import {
  CalendarGridView,
  type CalendarGridEventItem,
} from '@/components/shared/calendar-grid-view';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'milestone';
}

interface CalendarGridProps {
  view: 'day' | 'week' | 'month';
  events: CalendarEventItem[];
  rangeStart: string;
}

export function CalendarGrid({ events, ...props }: CalendarGridProps) {
  return (
    <CalendarGridView
      {...props}
      events={events as CalendarGridEventItem[]}
      typeBasedStatus
    />
  );
}
