import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { BriefType, TaskStatus } from "@repo/types";
import { createTask, fetchTask, listTasks, updateTask } from "../../server/nest-client";

export interface TaskToolsContext {
  client: AxiosInstance;
  projectId: string;
}

export function createAdminTaskTools(ctx: TaskToolsContext) {
  const assignSourcingTask = tool({
    description: "Assign a sourcing research task to a designer. Call listProjectTasks first to check what's already in progress.",
    inputSchema: z.object({
      designerId: z.string().describe("Real designer ID from project context — never invent"),
      title: z.string().describe("e.g. 'Source lightweight linen shirting for SS26 tops category'"),
      briefType: z.nativeEnum(BriefType),
      season: z.string().describe("Target season e.g. 'SS26', 'AW26'"),
      deliverables: z.string().describe(
        "Specific ask with quantity, specs, and color direction — e.g. '3-5 lightweight linen fabrics (150-220 g/m²), natural colors: ecru, ivory, sage. Include composition breakdown and MOQ.'"
      ),
      garmentCategory: z.enum([
        "outerwear", "tops", "bottoms", "knitwear", "denim", "accessories", "other",
      ]).optional(),
      colorDirection: z.string().optional().describe("e.g. 'neutral tones: ecru, ivory, stone'"),
      dueDate: z.string().optional().describe("ISO 8601 date"),
    }),
    execute: async (dto) => {
      const task = await createTask(ctx.client, {
        projectId: ctx.projectId,
        designerId: dto.designerId,
        title: dto.title,
        briefType: dto.briefType,
        deliverables: [
          `Season: ${dto.season}`,
          dto.garmentCategory ? `Category: ${dto.garmentCategory}` : "",
          dto.colorDirection ? `Color direction: ${dto.colorDirection}` : "",
          `Deliverables: ${dto.deliverables}`,
        ].filter(Boolean).join("\n"),
        dueDate: dto.dueDate,
      });
      return { id: task.id, title: task.title, status: task.status, designerId: task.designerId };
    },
  });

  const listProjectTasks = tool({
    description: "List sourcing tasks for this project.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = await listTasks(ctx.client, { projectId: ctx.projectId, limit: 50 });
      return {
        count: result.data.length,
        tasks: result.data.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          designerId: t.designerId,
          briefType: t.briefType,
        })),
      };
    },
  });

  const updateTaskStatus = tool({
    description: "Update task status or details (admin).",
    inputSchema: z.object({
      taskId: z.string(),
      status: z.nativeEnum(TaskStatus).optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    }),
    execute: async ({ taskId, ...dto }) => {
      const task = await updateTask(ctx.client, taskId, dto);
      return { id: task.id, status: task.status, title: task.title };
    },
  });

  return { assignSourcingTask, listProjectTasks, updateTaskStatus };
}

export function createDesignerTaskTools(ctx: { client: AxiosInstance }) {
  const listMyTasks = tool({
    description: "List sourcing tasks assigned to you.",
    inputSchema: z.object({
      status: z.nativeEnum(TaskStatus).optional(),
    }),
    execute: async ({ status }) => {
      const result = await listTasks(ctx.client, { status, limit: 50 });
      return {
        count: result.data.length,
        tasks: result.data.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          briefType: t.briefType,
          projectRef: t.projectRef,
          deliverables: t.deliverables,
          dueDate: t.dueDate,
        })),
      };
    },
  });

  const getTaskDetail = tool({
    description: "Get task brief details (sanitized — no customer PII).",
    inputSchema: z.object({ taskId: z.string() }),
    execute: async ({ taskId }) => {
      const task = await fetchTask(ctx.client, taskId);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        briefType: task.briefType,
        deliverables: task.deliverables,
        status: task.status,
        projectRef: task.projectRef,
        dueDate: task.dueDate,
      };
    },
  });

  const updateTaskProgress = tool({
    description: "Update task progress notes or status.",
    inputSchema: z.object({
      taskId: z.string(),
      status: z.nativeEnum(TaskStatus).optional(),
      description: z.string().optional(),
      deliverables: z.string().optional(),
    }),
    execute: async ({ taskId, ...dto }) => {
      const task = await updateTask(ctx.client, taskId, dto);
      return { id: task.id, status: task.status };
    },
  });

  const completeTask = tool({
    description: "Mark a sourcing task as completed.",
    inputSchema: z.object({ taskId: z.string() }),
    execute: async ({ taskId }) => {
      const task = await updateTask(ctx.client, taskId, { status: TaskStatus.COMPLETED });
      return { id: task.id, status: task.status, completed: true };
    },
  });

  return { listMyTasks, getTaskDetail, updateTaskProgress, completeTask };
}
