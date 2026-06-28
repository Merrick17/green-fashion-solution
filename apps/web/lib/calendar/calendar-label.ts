import { format, endOfWeek, startOfWeek } from "date-fns";
import { Views, type View } from "react-big-calendar";

export function formatCalendarToolbarLabel(date: Date, view: View): string {
  switch (view) {
    case Views.DAY:
      return format(date, "EEEE, MMMM d, yyyy");
    case Views.WEEK:
    case "work_week": {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = endOfWeek(date, { weekStartsOn: 0 });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "MMMM d")} – ${format(end, "d, yyyy")}`;
      }
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    case Views.AGENDA:
      return format(date, "MMMM d, yyyy");
    default:
      return format(date, "MMMM yyyy");
  }
}
