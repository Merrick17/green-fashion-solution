'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { View } from 'react-big-calendar';
const VIEW_LABELS: Record<string, string> = {
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
};
interface GoogleCalendarToolbarProps {
  label: string;
  view: View;
  views: View[];
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: View) => void;
}
export function GoogleCalendarToolbar({
  label,
  view,
  views,
  onToday,
  onPrev,
  onNext,
  onViewChange,
}: GoogleCalendarToolbarProps) {
  const viewList = views.filter((v) => v !== 'work_week');
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border border-portal-border bg-portal-surface px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 border-border px-4 font-normal shadow-none"
          onClick={onToday}
        >
          Today
        </Button>
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <h2 className="font-serif text-xl font-normal tracking-tight text-foreground sm:text-2xl">
          {label}
        </h2>
      </div>
      <div className="inline-flex h-9 items-center bg-secondary p-0.5">
        {viewList.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            className={cn(
              ' px-3 py-1.5 text-sm font-medium transition-colors',
              view === v
                ? 'bg-portal-main text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {VIEW_LABELS[v] ?? v}
          </button>
        ))}
      </div>
    </div>
  );
}
