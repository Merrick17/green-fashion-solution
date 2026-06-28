'use client';

import {
  CalendarGridView,
  type CalendarGridEventItem,
} from '@/components/shared/calendar-grid-view';

export type CalendarEventItem = CalendarGridEventItem;

interface CalendarGridProps {
  view: 'day' | 'week' | 'month';
  events: CalendarEventItem[];
  rangeStart: string;
}

export function CalendarGrid(props: CalendarGridProps) {
  return <CalendarGridView {...props} />;
}
