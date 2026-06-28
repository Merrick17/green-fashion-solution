import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { MeetingStatus } from "@repo/types";
import { listMeetings, updateMeeting } from "../../server/nest-client";

export function createMeetingTools(ctx: { client: AxiosInstance }) {
  const listMeetingsTool = tool({
    description: "List meeting requests and scheduled meetings.",
    inputSchema: z.object({}),
    execute: async () => {
      const meetings = await listMeetings(ctx.client);
      return {
        count: meetings.length,
        meetings: meetings.map((m) => ({
          id: m.id,
          status: m.status,
          agenda: m.agenda,
          scheduledAt: m.scheduledAt,
          projectId: m.projectId,
        })),
      };
    },
  });

  const approveMeeting = tool({
    description: "Approve or reschedule a meeting request (admin bridge).",
    inputSchema: z.object({
      meetingId: z.string(),
      status: z.nativeEnum(MeetingStatus).optional(),
      scheduledAt: z.string().optional(),
    }),
    execute: async ({ meetingId, ...dto }) => {
      const meeting = await updateMeeting(ctx.client, meetingId, dto);
      return { id: meeting.id, status: meeting.status, scheduledAt: meeting.scheduledAt };
    },
  });

  return { listMeetings: listMeetingsTool, approveMeeting };
}
