import { addHours, startOfDay } from "date-fns";
import type { CalendarResponse } from "@repo/types";

export type CalendarEventType = "meeting" | "milestone" | "task";

export interface PortalCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: CalendarEventType;
  status?: string;
  teamsLink?: string;
  projectId?: string;
}

function meetingWindow(iso: string) {
  const start = new Date(iso);
  const end = addHours(start, 1);
  return { start, end };
}

export function mapCalendarEvents(
  data: CalendarResponse | undefined,
  options: { milestones?: boolean; tasks?: boolean },
): PortalCalendarEvent[] {
  if (!data) return [];

  const meetings: PortalCalendarEvent[] =
    data.meetings?.map((m) => {
      const when = m.scheduledAt ?? m.requestedAt;
      const { start, end } = meetingWindow(when);
      return {
        id: `meeting-${m.id}`,
        title: `Meeting · ${m.projectId.slice(0, 8)}`,
        start,
        end,
        type: "meeting" as const,
        status: m.status,
        teamsLink: m.teamsLink,
        projectId: m.projectId,
      };
    }) ?? [];

  const milestones: PortalCalendarEvent[] = options.milestones
    ? (data.milestones?.map((m) => {
        const day = startOfDay(new Date(m.date));
        return {
          id: `milestone-${m.id}`,
          title: m.title,
          start: day,
          end: day,
          allDay: true,
          type: "milestone" as const,
          projectId: m.projectId,
        };
      }) ?? [])
    : [];

  const tasks: PortalCalendarEvent[] = options.tasks
    ? (data.tasks
        ?.filter((t) => t.dueDate)
        .map((t) => {
          const { start, end } = meetingWindow(t.dueDate!);
          return {
            id: `task-${t.id}`,
            title: t.title,
            start,
            end,
            type: "task" as const,
            status: t.status,
            projectId: t.projectId,
          };
        }) ?? [])
    : [];

  return [...meetings, ...milestones, ...tasks];
}

const MEETING_STATUS_CLASSES: Record<string, string> = {
  requested: "gcal-event gcal-event-meeting-pending",
  scheduled: "gcal-event gcal-event-meeting",
  approved: "gcal-event gcal-event-meeting",
};

const TYPE_BASE_CLASSES: Record<CalendarEventType, string> = {
  meeting: "gcal-event gcal-event-meeting",
  milestone: "gcal-event gcal-event-milestone",
  task: "gcal-event gcal-event-task",
};

export function eventStyleClass(event: PortalCalendarEvent): string {
  const status = event.status?.toLowerCase() ?? "";
  if (event.type === "meeting") {
    return MEETING_STATUS_CLASSES[status] ?? TYPE_BASE_CLASSES.meeting;
  }
  return TYPE_BASE_CLASSES[event.type];
}
