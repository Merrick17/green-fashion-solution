import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { View } from "react-big-calendar";

export function getCalendarFetchRange(date: Date, view: View) {
  let start: Date;
  let end: Date;

  switch (view) {
    case "day":
      start = startOfDay(date);
      end = endOfDay(date);
      break;
    case "week":
    case "work_week":
      start = startOfWeek(date, { weekStartsOn: 0 });
      end = endOfWeek(date, { weekStartsOn: 0 });
      break;
    case "agenda":
      start = startOfDay(date);
      end = endOfDay(addDays(date, 30));
      break;
    default:
      start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
      end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
      break;
  }

  return { start: start.toISOString(), end: end.toISOString() };
}
