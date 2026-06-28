import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { createMeeting, getCalendarEvents } from "../../server/nest-client";

export function createCustomerMeetingTools(ctx: {
  client: AxiosInstance;
  projectId: string;
}) {
  const requestMeeting = tool({
    description:
      "Request a consultation meeting with the sourcing team for this project.",
    inputSchema: z.object({
      requestedAt: z.string().describe("ISO 8601 datetime"),
      agenda: z.string().optional(),
      durationMinutes: z.number().min(15).max(120).optional(),
    }),
    execute: async ({ requestedAt, agenda, durationMinutes }) => {
      const meeting = await createMeeting(ctx.client, {
        projectId: ctx.projectId,
        requestedAt,
        agenda,
        durationMinutes,
      });
      return {
        id: meeting.id,
        status: meeting.status,
        requestedAt: meeting.requestedAt,
        submitted: true,
      };
    },
  });

  const getCalendarEventsTool = tool({
    description: "List your upcoming meetings and project milestones in a date range.",
    inputSchema: z.object({
      start: z.string().describe("ISO date start"),
      end: z.string().describe("ISO date end"),
    }),
    execute: async ({ start, end }) => {
      const calendar = await getCalendarEvents(ctx.client, start, end);
      return {
        meetings: calendar.meetings?.slice(0, 20) ?? [],
        milestones: calendar.milestones?.slice(0, 20) ?? [],
      };
    },
  });

  return { requestMeeting, getCalendarEvents: getCalendarEventsTool };
}
