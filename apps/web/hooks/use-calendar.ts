import { useQuery } from "@tanstack/react-query";
import { calendarApi } from "@/lib/api/calendar.api";
import { queryKeys } from "@/lib/query-keys";

export function useCalendar(start: string, end: string) {
  return useQuery({
    queryKey: queryKeys.calendar.range(start, end),
    queryFn: () => calendarApi.getEvents(start, end),
    enabled: !!start && !!end,
  });
}
