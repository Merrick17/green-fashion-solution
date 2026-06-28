import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { createMilestone, getCalendarEvents, listMilestones } from "../../server/nest-client";

export function createMilestoneTools(ctx: { client: AxiosInstance; projectId: string }) {
  const createMilestoneTool = tool({
    description: "Create a project milestone (sampling, production deadline).",
    inputSchema: z.object({
      title: z.string(),
      date: z.string(),
    }),
    execute: async (dto) => {
      const milestone = await createMilestone(ctx.client, {
        projectId: ctx.projectId,
        title: dto.title,
        date: dto.date,
      });
      return { id: milestone.id, title: milestone.title, date: milestone.date };
    },
  });

  return { createMilestone: createMilestoneTool };
}

export function createCalendarTools(ctx: { client: AxiosInstance }) {
  const getCalendarEventsTool = tool({
    description: "Get unified calendar events (meetings, milestones) for a date range.",
    inputSchema: z.object({
      start: z.string(),
      end: z.string(),
    }),
    execute: async ({ start, end }) => {
      const events = await getCalendarEvents(ctx.client, start, end);
      return events;
    },
  });

  return { getCalendarEvents: getCalendarEventsTool };
}

export function createListMilestonesTool(ctx: { client: AxiosInstance; projectId: string }) {
  return tool({
    description: "List milestones for the project.",
    inputSchema: z.object({}),
    execute: async () => {
      const milestones = await listMilestones(ctx.client, ctx.projectId);
      return { count: milestones.length, milestones };
    },
  });
}
